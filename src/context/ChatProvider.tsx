import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  deleteNotification,
  getStateInstance,
  receiveNotification,
  sendMessage,
} from "../api/greenapi";
import { formatChatName, toChatId } from "../utils/format";
import {
  clearAll,
  hasCredentials,
  loadActiveChatId,
  loadChats,
  loadCredentials,
  loadMessages,
  saveActiveChatId,
  saveChats,
  saveCredentials,
  saveMessages,
} from "../utils/storage";
import type {
  Chat,
  ChatMessage,
  Credentials,
  MessageData,
  MessageStatus,
  Notification,
  WebhookBody,
} from "../utils/types";
import { ChatContext, type ChatContextValue, type Connection } from "./chatContext";

/** Сколько секунд держать открытым запрос к очереди уведомлений (long polling). */
const RECEIVE_TIMEOUT_SECONDS = 10;

/** Пауза перед повторной попыткой после сетевой ошибки. */
const RETRY_DELAY_MS = 5000;

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);

    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

/** Достаёт текст из messageData; нетекстовые типы помечаются как неподдерживаемые. */
function extractText(messageData: MessageData): { text: string; unsupported: boolean } {
  if (messageData.typeMessage === "textMessage") {
    return { text: messageData.textMessageData?.textMessage ?? "", unsupported: false };
  }

  if (messageData.typeMessage === "extendedTextMessage") {
    const data = messageData.extendedTextMessageData;
    return { text: data?.text ?? data?.description ?? "", unsupported: false };
  }

  return { text: "Сообщение этого типа не поддерживается", unsupported: true };
}

function toMessageStatus(status: string): MessageStatus {
  switch (status) {
    case "sent":
    case "delivered":
    case "read":
      return status;
    default:
      return "failed";
  }
}

const OFFLINE: Connection = { status: "offline" };

/** Статусы приходят не по порядку — понижать достигнутый нельзя. */
const STATUS_WEIGHT: Record<MessageStatus, number> = {
  failed: 0,
  pending: 1,
  sent: 2,
  delivered: 3,
  read: 4,
};

export function ChatProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<Credentials>(loadCredentials);
  const [chats, setChats] = useState<Chat[]>(loadChats);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(loadMessages);
  const [activeChatId, setActiveChatId] = useState<string>(loadActiveChatId);
  const [connection, setConnection] = useState<Connection>({ status: "offline" });

  /** Даёт циклу опроса доступ к актуальному чату без его перезапуска. */
  const activeChatIdRef = useRef(activeChatId);

  const isAuthorized = hasCredentials(credentials);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => saveChats(chats), [chats]);
  useEffect(() => saveMessages(messages), [messages]);
  useEffect(() => saveActiveChatId(activeChatId), [activeChatId]);

  /* ---------- Мутации состояния ---------- */

  const upsertChat = useCallback((chatId: string, incrementUnread: boolean) => {
    setChats((previous) => {
      const existing = previous.find((chat) => chat.id === chatId);

      if (!existing) {
        return [
          ...previous,
          {
            id: chatId,
            name: formatChatName(chatId),
            createdAt: Date.now(),
            unreadCount: incrementUnread ? 1 : 0,
          },
        ];
      }

      if (!incrementUnread) return previous;

      return previous.map((chat) =>
        chat.id === chatId ? { ...chat, unreadCount: chat.unreadCount + 1 } : chat,
      );
    });
  }, []);

  /** Добавляет сообщение, игнорируя повторы по idMessage. */
  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((previous) => {
      const list = previous[message.chatId] ?? [];

      if (list.some((item) => item.id === message.id)) return previous;

      const next = [...list, message].sort((a, b) => a.timestamp - b.timestamp);

      return { ...previous, [message.chatId]: next };
    });
  }, []);

  const updateMessage = useCallback(
    (chatId: string, messageId: string, patch: Partial<ChatMessage>) => {
      setMessages((previous) => {
        const list = previous[chatId];
        if (!list) return previous;

        const next = list.map((item) => (item.id === messageId ? { ...item, ...patch } : item));

        // Если вебхук об этом же сообщении успел прийти раньше ответа sendMessage,
        // после подстановки idMessage в списке окажется два одинаковых id
        const deduped = next.filter(
          (item, index) => next.findIndex((other) => other.id === item.id) === index,
        );

        return { ...previous, [chatId]: deduped };
      });
    },
    [],
  );

  /* ---------- Обработка уведомлений ---------- */

  const handleWebhook = useCallback(
    (body: WebhookBody) => {
      switch (body.typeWebhook) {
        case "incomingMessageReceived":
        case "outgoingMessageReceived":
        case "outgoingAPIMessageReceived": {
          const chatId = body.senderData.chatId;

          // Групповые чаты приложение не поддерживает
          if (!chatId.endsWith("@c.us")) return;

          const { text, unsupported } = extractText(body.messageData);
          if (!text) return;

          const incoming = body.typeWebhook === "incomingMessageReceived";

          upsertChat(chatId, incoming && activeChatIdRef.current !== chatId);

          appendMessage({
            id: body.idMessage,
            chatId,
            direction: incoming ? "incoming" : "outgoing",
            text,
            timestamp: body.timestamp * 1000,
            status: incoming ? "read" : "sent",
            unsupported,
          });
          return;
        }

        case "outgoingMessageStatus": {
          const status = toMessageStatus(body.status);

          setMessages((previous) => {
            const list = previous[body.chatId];
            if (!list) return previous;

            let changed = false;

            const next = list.map((item) => {
              if (item.id !== body.idMessage) return item;
              if (STATUS_WEIGHT[status] <= STATUS_WEIGHT[item.status]) return item;

              changed = true;
              return { ...item, status };
            });

            return changed ? { ...previous, [body.chatId]: next } : previous;
          });
          return;
        }

        default:
          // stateInstanceChanged, deviceInfo и прочее приложению не нужны
          return;
      }
    },
    [appendMessage, upsertChat],
  );

  /* ---------- Цикл получения сообщений ---------- */

  useEffect(() => {
    if (!hasCredentials(credentials)) return;

    const controller = new AbortController();
    let cancelled = false;

    const poll = async () => {
      setConnection({ status: "connecting" });

      try {
        const state = await getStateInstance(credentials);
        if (cancelled) return;

        setConnection(
          state.stateInstance === "authorized"
            ? { status: "online" }
            : { status: "error", detail: `Инстанс: ${state.stateInstance}` },
        );
      } catch {
        if (cancelled) return;
        setConnection({ status: "error", detail: "Не удалось проверить инстанс" });
      }

      while (!cancelled) {
        try {
          const notification: Notification | null = await receiveNotification(
            credentials,
            RECEIVE_TIMEOUT_SECONDS,
            controller.signal,
          );

          if (cancelled) return;

          setConnection((current) => (current.status === "online" ? current : { status: "online" }));

          if (!notification) continue;

          handleWebhook(notification.body);

          // Пока уведомление не удалено, очередь не отдаст следующее
          await deleteNotification(credentials, notification.receiptId);
        } catch (error) {
          if (cancelled || controller.signal.aborted) return;

          setConnection({
            status: "error",
            detail: error instanceof Error ? error.message : "Ошибка соединения",
          });

          await delay(RETRY_DELAY_MS, controller.signal);
        }
      }
    };

    void poll();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [credentials, handleWebhook]);

  /* ---------- Действия ---------- */

  const login = useCallback((next: Credentials) => {
    saveCredentials(next);
    setCredentials(next);
  }, []);

  const logout = useCallback(() => {
    clearAll();
    setCredentials({ idInstance: "", apiTokenInstance: "" });
    setChats([]);
    setMessages({});
    setActiveChatId("");
  }, []);

  const openChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    setChats((previous) =>
      previous.map((chat) => (chat.id === chatId ? { ...chat, unreadCount: 0 } : chat)),
    );
  }, []);

  const createChat = useCallback(
    (phone: string) => {
      const chatId = toChatId(phone);
      upsertChat(chatId, false);
      openChat(chatId);
      return chatId;
    },
    [openChat, upsertChat],
  );

  const removeChat = useCallback((chatId: string) => {
    setChats((previous) => previous.filter((chat) => chat.id !== chatId));
    setMessages((previous) => {
      const next = { ...previous };
      delete next[chatId];
      return next;
    });
    setActiveChatId((current) => (current === chatId ? "" : current));
  }, []);

  const sendText = useCallback(
    async (text: string) => {
      const chatId = activeChatIdRef.current;
      const trimmed = text.trim();

      if (!chatId || !trimmed) return;

      // Оптимистичное сообщение: показываем сразу, id заменим ответом сервера
      const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      appendMessage({
        id: localId,
        chatId,
        direction: "outgoing",
        text: trimmed,
        timestamp: Date.now(),
        status: "pending",
      });

      try {
        const { idMessage } = await sendMessage(credentials, { chatId, message: trimmed });
        updateMessage(chatId, localId, { id: idMessage, status: "sent" });
      } catch {
        updateMessage(chatId, localId, { status: "failed" });
      }
    },
    [appendMessage, credentials, updateMessage],
  );

  /* ---------- Значение контекста ---------- */

  const sortedChats = useMemo(() => {
    const lastActivity = (chat: Chat) => {
      const list = messages[chat.id];
      return list?.length ? list[list.length - 1].timestamp : chat.createdAt;
    };

    return [...chats].sort((a, b) => lastActivity(b) - lastActivity(a));
  }, [chats, messages]);

  const value = useMemo<ChatContextValue>(
    () => ({
      credentials,
      isAuthorized,
      chats: sortedChats,
      messages,
      activeChatId,
      activeChat: chats.find((chat) => chat.id === activeChatId) ?? null,
      connection: isAuthorized ? connection : OFFLINE,
      login,
      logout,
      openChat,
      createChat,
      removeChat,
      sendText,
    }),
    [
      activeChatId,
      chats,
      connection,
      createChat,
      credentials,
      isAuthorized,
      login,
      logout,
      messages,
      openChat,
      removeChat,
      sendText,
      sortedChats,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
