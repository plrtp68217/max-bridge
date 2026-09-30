const CHAT_ID_POSTFIX = "@c.us";

/** 79208036508 -> 79208036508@c.us */
export function toChatId(phone: string): string {
  return `${phone.replace(/\D/g, "")}${CHAT_ID_POSTFIX}`;
}

/** 79208036508@c.us -> 79208036508 */
export function toPhone(chatId: string): string {
  return chatId.replace(/@.+$/, "");
}

/** 79208036508@c.us -> +7 920 803-65-08 */
export function formatChatName(chatId: string): string {
  const digits = toPhone(chatId);

  const russian = /^7(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(digits);
  if (russian) {
    const [, code, a, b, c] = russian;
    return `+7 ${code} ${a}-${b}-${c}`;
  }

  return digits ? `+${digits}` : chatId;
}

export function initialsOf(name: string): string {
  const letters = name.replace(/[^\p{L}\p{N}]/gu, "");
  return letters.slice(-2).toUpperCase() || "?";
}

/** Устойчивый выбор цвета аватара по chatId. */
export function avatarIndex(chatId: string, total: number): number {
  let hash = 0;
  for (let i = 0; i < chatId.length; i += 1) {
    hash = (hash * 31 + chatId.charCodeAt(i)) % 100000;
  }
  return hash % total;
}

const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
});

const dayFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});

const dayWithYearFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDayFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
});

export function formatTime(timestamp: number): string {
  return timeFormatter.format(timestamp);
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Разделитель между днями в ленте сообщений. */
export function formatDayDivider(timestamp: number): string {
  const date = new Date(timestamp);
  const today = startOfDay(new Date());
  const day = startOfDay(date);
  const dayInMs = 24 * 60 * 60 * 1000;

  if (day === today) return "Сегодня";
  if (day === today - dayInMs) return "Вчера";

  return date.getFullYear() === new Date().getFullYear()
    ? dayFormatter.format(date)
    : dayWithYearFormatter.format(date);
}

/** Время последнего сообщения в списке чатов. */
export function formatChatListTime(timestamp: number): string {
  const date = new Date(timestamp);
  const today = startOfDay(new Date());

  return startOfDay(date) === today ? timeFormatter.format(date) : shortDayFormatter.format(date);
}

export function isSameDay(a: number, b: number): boolean {
  return startOfDay(new Date(a)) === startOfDay(new Date(b));
}
