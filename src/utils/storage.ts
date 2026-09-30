import type { Credentials } from "./types";

const KEYS = {
  ID_INSTANCE: "greenapi.idInstance",
  API_TOKEN: "greenapi.apiTokenInstance",
  CHAT_ID: "greenapi.chatId",
};

export function saveCredentials(creds: Credentials) {
  localStorage.setItem(KEYS.ID_INSTANCE, creds.idInstance);
  localStorage.setItem(KEYS.API_TOKEN, creds.apiTokenInstance);
}

export function loadCredentials(): Credentials {
  return {
    idInstance: localStorage.getItem(KEYS.ID_INSTANCE) ?? "",
    apiTokenInstance: localStorage.getItem(KEYS.API_TOKEN) ?? "",
  };
}

export function saveChatId(chatId: string) {
  localStorage.setItem(KEYS.CHAT_ID, chatId);
}

export function loadChatId(): string {
  return localStorage.getItem(KEYS.CHAT_ID) ?? "";
}

export function clearAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}