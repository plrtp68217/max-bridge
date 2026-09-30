import { useEffect, useRef, useState, type ReactNode } from "react";
import { checkAccount, deleteNotification, receiveNotification, sendMessage } from "../api/greenapi";
import { formatPhone } from "../utils/format";
import { clearAll, KEYS, load, save } from "../utils/storage";
import type { Chat, ChatMessage, Credentials, MessageData, MessageStatus, WebhookBody } from "../utils/types";
import { ChatContext, type ConnectionStatus } from "./chatContext";

/** Статусы приходят не по порядку — понижать уже достигнутый нельзя. */
const STATUS_ORDER: MessageStatus[] = ["failed", "pending", "sent", "delivered", "read"];

function extractText(data: MessageData): { text: string; unsupported?: boolean } {
  switch (data.typeMessage) {
    case "textMessage":
      return { text: data.textMessageData?.textMessage ?? "" };
    case "extendedTextMessage":
    case "quotedMessage":
      return { text: data.extendedTextMessageData?.text ?? "" };
    default:
      return { text: "Сообщение этого типа не поддерживается", unsupported: true };
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState(() => load<Credentials | null>(KEYS.credentials, null));
  const [chats, setChats] = useState(() => load<Chat[]>(KEYS.chats, []));
  const [messages, setMessages] = useState(() => load<Record<string, ChatMessage[]>>(KEYS.messages, {}));
  const [activeChatId, setActiveChatId] = useState(() => load(KEYS.activeChatId, ""));
  const [connection, setConnection] = useState<ConnectionStatus>("connecting");

  // Цикл опроса живёт дольше одного рендера — актуальный чат читает через ref
  const activeChatIdRef = useRef(activeChatId);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
    save(KEYS.activeChatId, activeChatId);
  }, [activeChatId]);
  useEffect(() => save(KEYS.chats, chats), [chats]);
  useEffect(() => save(KEYS.messages, messages), [messages]);

  /* ---------- Получение уведомлений ---------- */

  useEffect(() => {
    if (!credentials) return;

    const handle = (body: WebhookBody) => {
      if (body.typeWebhook === "outgoingMessageStatus") {
        const status = body.status as MessageStatus;
        if (!body.chatId || !["sent", "delivered", "read"].includes(status)) return;

        setMessages((prev) => {
          const list = prev[body.chatId!];
          const target = list?.find((m) => m.id === body.idMessage);
          if (!target || STATUS_ORDER.indexOf(status) <= STATUS_ORDER.indexOf(target.status)) return prev;
          return { ...prev, [body.chatId!]: list.map((m) => (m === target ? { ...m, status } : m)) };
        });
        return;
      }

      // outgoingAPIMessageReceived не обрабатываем: это наши же отправки, они уже в ленте
      const incoming = body.typeWebhook === "incomingMessageReceived";
      if (!incoming && body.typeWebhook !== "outgoingMessageReceived") return;

      const { senderData: sender, messageData, idMessage } = body;
      // Отрицательный chatId — групповой чат, их не поддерживаем
      if (!sender || !messageData || !idMessage || sender.chatId.startsWith("-")) return;

      const chatId = sender.chatId;
      const { text, unsupported } = extractText(messageData);
      if (!text) return;

      const unread = incoming && activeChatIdRef.current !== chatId ? 1 : 0;
      setChats((prev) => {
        if (!prev.some((c) => c.id === chatId)) {
          const name = sender.chatName || sender.senderName || chatId;
          return [...prev, { id: chatId, name, createdAt: Date.now(), unreadCount: unread }];
        }
        return unread
          ? prev.map((c) => (c.id === chatId ? { ...c, unreadCount: c.unreadCount + 1 } : c))
          : prev;
      });

      const message: ChatMessage = {
        id: idMessage,
        chatId,
        direction: incoming ? "incoming" : "outgoing",
        text,
        timestamp: body.timestamp * 1000,
        status: incoming ? "read" : "sent",
        unsupported,
      };

      setMessages((prev) => {
        const list = prev[chatId] ?? [];
        if (list.some((m) => m.id === message.id)) return prev;
        return { ...prev, [chatId]: [...list, message].sort((a, b) => a.timestamp - b.timestamp) };
      });
    };

    const controller = new AbortController();

    (async () => {
      while (!controller.signal.aborted) {
        try {
          const notification = await receiveNotification(credentials, controller.signal);
          setConnection("online");
          if (!notification) continue;

          try {
            handle(notification.body);
          } catch (error) {
            console.error("Не удалось обработать уведомление", notification, error);
          }
          // Удаляем даже необработанное, иначе одно «кривое» уведомление заблокирует очередь
          await deleteNotification(credentials, notification.receiptId);
        } catch {
          if (controller.signal.aborted) return;
          setConnection("error");
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    })();

    return () => controller.abort();
  }, [credentials]);

  /* ---------- Действия ---------- */

  const login = (next: Credentials) => {
    save(KEYS.credentials, next);
    setConnection("connecting");
    setCredentials(next);
  };

  const logout = () => {
    clearAll();
    setCredentials(null);
    setChats([]);
    setMessages({});
    setActiveChatId("");
  };

  const openChat = (chatId: string) => {
    setActiveChatId(chatId);
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)));
  };

  const createChat = async (phone: string) => {
    const chatId = await checkAccount(credentials!, phone);
    if (!chatId) throw new Error("Этот номер не зарегистрирован в MAX");

    setChats((prev) =>
      prev.some((c) => c.id === chatId)
        ? prev
        : [...prev, { id: chatId, name: formatPhone(phone), createdAt: Date.now(), unreadCount: 0 }],
    );
    openChat(chatId);
  };

  const removeChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    setMessages((prev) => {
      const next = { ...prev };
      delete next[chatId];
      return next;
    });
    if (activeChatId === chatId) setActiveChatId("");
  };

  const sendText = async (text: string) => {
    const chatId = activeChatId;
    // Оптимистичное сообщение: показываем сразу, id заменим ответом сервера
    const localId = `local-${Date.now()}`;
    const update = (patch: Partial<ChatMessage>) =>
      setMessages((prev) => ({
        ...prev,
        [chatId]: prev[chatId].map((m) => (m.id === localId ? { ...m, ...patch } : m)),
      }));

    setMessages((prev) => ({
      ...prev,
      [chatId]: [
        ...(prev[chatId] ?? []),
        { id: localId, chatId, direction: "outgoing", text, timestamp: Date.now(), status: "pending" },
      ],
    }));

    try {
      update({ id: await sendMessage(credentials!, chatId, text), status: "sent" });
    } catch {
      update({ status: "failed" });
    }
  };

  const lastActivity = (chat: Chat) => messages[chat.id]?.at(-1)?.timestamp ?? chat.createdAt;

  return (
    <ChatContext.Provider
      value={{
        isAuthorized: credentials !== null,
        chats: [...chats].sort((a, b) => lastActivity(b) - lastActivity(a)),
        messages,
        activeChat: chats.find((c) => c.id === activeChatId) ?? null,
        connection,
        login,
        logout,
        openChat,
        createChat,
        removeChat,
        sendText,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
