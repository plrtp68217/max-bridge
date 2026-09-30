import type { 
  Credentials, 
  SendMessageRequest, 
  SendMessageResponse,
  ReceiveNotificationResponse,
  DeleteNotificationResponse
} from "../utils/types";

const BASE_URL = "https://api.green-api.com";

export async function sendMessage(credentials: Credentials, messageRequest: SendMessageRequest): Promise<SendMessageResponse> {
  const response = await fetch(
    `${BASE_URL}/waInstance${credentials.idInstance}/sendMessage/${credentials.apiTokenInstance}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageRequest),
    }
  );

  return response.json() as Promise<SendMessageResponse>;
}

export async function receiveNotification(credentials: Credentials, receiveTimeout: number = 5): Promise<ReceiveNotificationResponse> {
  const response = await fetch(
    `${BASE_URL}/waInstance${credentials.idInstance}/receiveNotification/${credentials.apiTokenInstance}?receiveTimeout=${receiveTimeout}`,
  );

  return response.json() as Promise<ReceiveNotificationResponse>;
}

export async function deleteNotification(credentials: Credentials, receiptId: number): Promise<DeleteNotificationResponse> {
  const response = await fetch(
    `${BASE_URL}/waInstance${credentials.idInstance}/deleteNotification/${credentials.apiTokenInstance}/${receiptId}`,
    { method: "DELETE" }
  );

  return response.json() as Promise<DeleteNotificationResponse>;
}