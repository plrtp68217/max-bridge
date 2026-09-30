import type { Credentials, Notification } from "../utils/types";

const BASE_URL = "https://api.green-api.com";

type CallOptions = { path?: string; body?: unknown; method?: string; signal?: AbortSignal };

async function call<T>(
  { idInstance, apiTokenInstance }: Credentials,
  method: string,
  { path = "", body, ...init }: CallOptions = {},
): Promise<T | null> {
  const response = await fetch(
    `${BASE_URL}/waInstance${idInstance}/${method}/${apiTokenInstance}${path}`,
    body === undefined
      ? init
      : { ...init, method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
  );

  const raw = await response.text();
  if (!response.ok) throw new Error(raw || `${method}: HTTP ${response.status}`);

  // receiveNotification отвечает пустым телом, если очередь пуста
  return raw.trim() ? (JSON.parse(raw) as T) : null;
}

export async function sendMessage(credentials: Credentials, chatId: string, message: string) {
  const result = await call<{ idMessage: string }>(credentials, "sendMessage", {
    body: { chatId, message },
  });
  if (!result?.idMessage) throw new Error("Сервер не вернул idMessage");
  return result.idMessage;
}

/**
 * В MAX chatId собеседника — внутренний id, а не номер телефона.
 * Входящие приходят именно с ним, поэтому чат нужно создавать по этому id.
 */
export async function checkAccount(credentials: Credentials, phone: string) {
  const result = await call<{ exist: boolean; chatId: string }>(credentials, "checkAccount", {
    body: { phoneNumber: Number(phone) },
  });
  return result?.exist && result.chatId ? result.chatId : null;
}

/** Long polling очереди уведомлений; null — за timeout ничего не пришло. */
export function receiveNotification(credentials: Credentials, signal: AbortSignal) {
  return call<Notification>(credentials, "receiveNotification", {
    path: "?receiveTimeout=20",
    signal,
  });
}

/** Пока уведомление не удалено, очередь не отдаст следующее. */
export function deleteNotification(credentials: Credentials, receiptId: number) {
  return call(credentials, "deleteNotification", { path: `/${receiptId}`, method: "DELETE" });
}
