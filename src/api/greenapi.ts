import type {
  Credentials,
  DeleteNotificationResponse,
  Notification,
  SendMessageRequest,
  SendMessageResponse,
  StateInstanceResponse,
} from "../utils/types";

const BASE_URL = "https://api.green-api.com";

export class GreenApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GreenApiError";
    this.status = status;
  }
}

function methodUrl(credentials: Credentials, method: string, path = ""): string {
  return `${BASE_URL}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}${path}`;
}

/**
 * Обёртка над fetch: приводит HTTP-ошибки к GreenApiError и разбирает тело,
 * которое у GREEN-API может быть пустым (например, у receiveNotification).
 */
async function request<T>(url: string, init?: RequestInit): Promise<T | null> {
  const response = await fetch(url, init);

  const raw = await response.text();

  if (!response.ok) {
    throw new GreenApiError(
      raw || `Запрос завершился с кодом ${response.status}`,
      response.status,
    );
  }

  if (!raw.trim()) return null;

  return JSON.parse(raw) as T;
}

export async function sendMessage(
  credentials: Credentials,
  messageRequest: SendMessageRequest,
): Promise<SendMessageResponse> {
  const result = await request<SendMessageResponse>(methodUrl(credentials, "sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messageRequest),
  });

  if (!result?.idMessage) {
    throw new GreenApiError("Сервер не вернул идентификатор сообщения", 200);
  }

  return result;
}

/**
 * Длинный опрос очереди входящих уведомлений.
 * Возвращает null, если за время receiveTimeout ничего не пришло.
 */
export async function receiveNotification(
  credentials: Credentials,
  receiveTimeout = 10,
  signal?: AbortSignal,
): Promise<Notification | null> {
  return request<Notification>(
    methodUrl(credentials, "receiveNotification", `?receiveTimeout=${receiveTimeout}`),
    { signal },
  );
}

/** Уведомление нужно удалить из очереди, иначе оно придёт повторно. */
export async function deleteNotification(
  credentials: Credentials,
  receiptId: number,
): Promise<DeleteNotificationResponse | null> {
  return request<DeleteNotificationResponse>(
    methodUrl(credentials, "deleteNotification", `/${receiptId}`),
    { method: "DELETE" },
  );
}

export async function getStateInstance(credentials: Credentials): Promise<StateInstanceResponse> {
  const result = await request<StateInstanceResponse>(methodUrl(credentials, "getStateInstance"));

  if (!result) throw new GreenApiError("Пустой ответ getStateInstance", 200);

  return result;
}
