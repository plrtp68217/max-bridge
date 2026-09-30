export type Credentials = {
  idInstance: string;
  apiTokenInstance: string;
};

export type MessageStatus = "pending" | "sent" | "delivered" | "read" | "failed";

export type ChatMessage = {
  /** idMessage из GREEN-API — используется для дедупликации */
  id: string;
  chatId: string;
  direction: "incoming" | "outgoing";
  text: string;
  /** Время в миллисекундах */
  timestamp: number;
  status: MessageStatus;
  /** true для типов сообщений, которые приложение не отображает (файлы, гео и т.п.) */
  unsupported?: boolean;
};

export type Chat = {
  /** chatId пользователя в MAX (не номер телефона), например "10000000" */
  id: string;
  name: string;
  createdAt: number;
  unreadCount: number;
};

/* ---------- Уведомления GREEN-API (receiveNotification) ---------- */

export type MessageData = {
  typeMessage: string;
  textMessageData?: { textMessage: string };
  extendedTextMessageData?: { text?: string };
};

export type WebhookBody = {
  typeWebhook: string;
  timestamp: number;
  idMessage?: string;
  /** Есть у входящих/исходящих сообщений */
  senderData?: { chatId: string; chatName?: string; senderName?: string };
  messageData?: MessageData;
  /** Есть у outgoingMessageStatus */
  chatId?: string;
  status?: string;
};

export type Notification = {
  receiptId: number;
  body: WebhookBody;
};
