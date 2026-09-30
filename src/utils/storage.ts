/** Все данные приложения лежат в localStorage под этими ключами. */
export const KEYS = {
  credentials: "maxbridge.credentials",
  chats: "maxbridge.chats",
  messages: "maxbridge.messages",
  activeChatId: "maxbridge.activeChatId",
};

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* приватный режим или превышена квота — история просто не сохранится */
  }
}

export function clearAll() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
