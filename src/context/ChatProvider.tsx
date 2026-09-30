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
  const [chat, setChat] = useState(() => load<Chat | null>(KEYS.chat, null));
  const [messages, setMessages] = useState(() => {
    // Прошлая версия хранила здесь объект «чат → сообщения»
    const saved = load<ChatMessage[]>(KEYS.messages, []);
    return Array.isArray(saved) ? saved : [];
  });
  const [connection, setConnection] = useState<ConnectionStatus>("connecting");

  // Цикл опроса живёт дольше одного рендера — текущий чат читает через ref
  const chatIdRef = useRef(chat?.id);

  useEffect(() => {
    chatIdRef.current = chat?.id;
    save(KEYS.chat, chat);
  }, [chat]);
  useEffect(() => save(KEYS.messages, messages), [messages]);

  /* ---------- Получение уведомлений ---------- */

  useEffect(() => {
    if (!credentials) return;

    const handle = (body: WebhookBody) => {
      if (body.typeWebhook === "outgoingMessageStatus") {
        const status = body.status as MessageStatus;
        if (body.chatId !== chatIdRef.current || !["sent", "delivered", "read"].includes(status)) return;

        setMessages((prev) => {
          const target = prev.find((m) => m.id === body.idMessage);
          if (!target || STATUS_ORDER.indexOf(status) <= STATUS_ORDER.indexOf(target.status)) return prev;
          return prev.map((m) => (m === target ? { ...m, status } : m));
        });
        return;
      }

      // outgoingAPIMessageReceived не обрабатываем: это наши же отправки, они уже в ленте
      const incoming = body.typeWebhook === "incomingMessageReceived";
      if (!incoming && body.typeWebhook !== "outgoingMessageReceived") return;

      const { senderData: sender, messageData, idMessage } = body;
      // Показываем только переписку с текущим собеседником
      if (!sender || !messageData || !idMessage || sender.chatId !== chatIdRef.current) return;

      const { text, unsupported } = extractText(messageData);
      if (!text) return;

      const message: ChatMessage = {
        id: idMessage,
        direction: incoming ? "incoming" : "outgoing",
        text,
        timestamp: body.timestamp * 1000,
        status: incoming ? "read" : "sent",
        unsupported,
      };

      setMessages((prev) =>
        prev.some((m) => m.id === message.id)
          ? prev
          : [...prev, message].sort((a, b) => a.timestamp - b.timestamp),
      );
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
    setChat(null);
    setMessages([]);
  };

  const startChat = async (phone: string) => {
    const chatId = await checkAccount(credentials!, phone);
    if (!chatId) throw new Error("Этот номер не зарегистрирован в MAX");

    // История хранится только для одного собеседника
    if (chatId !== chat?.id) setMessages([]);
    setChat({ id: chatId, name: formatPhone(phone) });
  };

  const sendText = async (text: string) => {
    const chatId = chat!.id;
    // Оптимистичное сообщение: показываем сразу, id заменим ответом сервера
    const localId = `local-${Date.now()}`;
    const update = (patch: Partial<ChatMessage>) =>
      setMessages((prev) => prev.map((m) => (m.id === localId ? { ...m, ...patch } : m)));

    setMessages((prev) => [
      ...prev,
      { id: localId, direction: "outgoing", text, timestamp: Date.now(), status: "pending" },
    ]);

    try {
      update({ id: await sendMessage(credentials!, chatId, text), status: "sent" });
    } catch {
      update({ status: "failed" });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        isAuthorized: credentials !== null,
        chat,
        messages,
        connection,
        login,
        logout,
        startChat,
        sendText,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
