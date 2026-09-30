/* ---------- Авторизация ---------- */

export type Credentials = {
  idInstance: string;
  apiTokenInstance: string;
};

/* ---------- Модель данных приложения ---------- */

export type MessageDirection = "incoming" | "outgoing";

export type MessageStatus = "pending" | "sent" | "delivered" | "read" | "failed";

export type ChatMessage = {
  /** idMessage из GREEN-API — используется для дедупликации */
  id: string;
  chatId: string;
  direction: MessageDirection;
  text: string;
  /** Время в миллисекундах */
  timestamp: number;
  status: MessageStatus;
  /** true для типов сообщений, которые приложение не отображает (файлы, гео и т.п.) */
  unsupported?: boolean;
};

export type Chat = {
  /** chatId вида 79001234567@c.us */
  id: string;
  name: string;
  createdAt: number;
  unreadCount: number;
};

/* ---------- Запросы к GREEN-API ---------- */

export type SendMessageRequest = {
  chatId: string;
  message: string;
};

export type SendMessageResponse = {
  idMessage: string;
};

export type StateInstanceResponse = {
  stateInstance: "authorized" | "notAuthorized" | "blocked" | "sleepMode" | "starting";
};

export type DeleteNotificationResponse = {
  result: boolean;
};

/* ---------- Вебхуки (receiveNotification) ---------- */

export type WebhookType =
  | "incomingMessageReceived"
  | "outgoingMessageReceived"
  | "outgoingAPIMessageReceived"
  | "outgoingMessageStatus"
  | "stateInstanceChanged"
  | "statusInstanceChanged"
  | "deviceInfo"
  | "incomingCall";

export type MessageData = {
  typeMessage: string;
  textMessageData?: { textMessage: string };
  extendedTextMessageData?: { text?: string; description?: string; title?: string };
};

export type SenderData = {
  chatId: string;
  sender?: string;
  chatName?: string;
  senderName?: string;
  senderContactName?: string;
};

export type MessageWebhookBody = {
  typeWebhook: "incomingMessageReceived" | "outgoingMessageReceived" | "outgoingAPIMessageReceived";
  timestamp: number;
  idMessage: string;
  senderData: SenderData;
  messageData: MessageData;
};

export type StatusWebhookBody = {
  typeWebhook: "outgoingMessageStatus";
  timestamp: number;
  chatId: string;
  idMessage: string;
  status: "sent" | "delivered" | "read" | "failed" | "noAccount" | "notInGroup";
};

export type OtherWebhookBody = {
  typeWebhook: Exclude<
    WebhookType,
    | "incomingMessageReceived"
    | "outgoingMessageReceived"
    | "outgoingAPIMessageReceived"
    | "outgoingMessageStatus"
  >;
  timestamp: number;
};

export type WebhookBody = MessageWebhookBody | StatusWebhookBody | OtherWebhookBody;

export type Notification = {
  receiptId: number;
  body: WebhookBody;
};
