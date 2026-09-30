import type { Chat, ChatMessage, Credentials } from "./types";

const KEYS = {
  ID_INSTANCE: "greenapi.idInstance",
  API_TOKEN: "greenapi.apiTokenInstance",
  CHATS: "greenapi.chats",
  MESSAGES: "greenapi.messages",
  ACTIVE_CHAT: "greenapi.activeChatId",
};

/** Сколько сообщений храним в одном чате, чтобы не переполнить localStorage. */
const MESSAGES_LIMIT = 500;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* приватный режим или превышена квота — история просто не сохранится */
  }
}

/* ---------- Учётные данные ---------- */

export function saveCredentials(credentials: Credentials) {
  localStorage.setItem(KEYS.ID_INSTANCE, credentials.idInstance);
  localStorage.setItem(KEYS.API_TOKEN, credentials.apiTokenInstance);
}

export function loadCredentials(): Credentials {
  return {
    idInstance: localStorage.getItem(KEYS.ID_INSTANCE) ?? "",
    apiTokenInstance: localStorage.getItem(KEYS.API_TOKEN) ?? "",
  };
}

export function hasCredentials(credentials: Credentials): boolean {
  return Boolean(credentials.idInstance && credentials.apiTokenInstance);
}

/* ---------- Чаты и сообщения ---------- */

export function loadChats(): Chat[] {
  return read<Chat[]>(KEYS.CHATS, []);
}

export function saveChats(chats: Chat[]) {
  write(KEYS.CHATS, chats);
}

export function loadMessages(): Record<string, ChatMessage[]> {
  return read<Record<string, ChatMessage[]>>(KEYS.MESSAGES, {});
}

export function saveMessages(messages: Record<string, ChatMessage[]>) {
  const trimmed: Record<string, ChatMessage[]> = {};

  for (const [chatId, list] of Object.entries(messages)) {
    trimmed[chatId] = list.slice(-MESSAGES_LIMIT);
  }

  write(KEYS.MESSAGES, trimmed);
}

export function loadActiveChatId(): string {
  return localStorage.getItem(KEYS.ACTIVE_CHAT) ?? "";
}

export function saveActiveChatId(chatId: string) {
  localStorage.setItem(KEYS.ACTIVE_CHAT, chatId);
}

export function clearAll() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
