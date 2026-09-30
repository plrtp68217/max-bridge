import { createContext, useContext } from "react";
import type { Chat, ChatMessage, Credentials } from "../utils/types";

export type ConnectionStatus = "connecting" | "online" | "error";

export type ChatContextValue = {
  isAuthorized: boolean;
  chats: Chat[];
  messages: Record<string, ChatMessage[]>;
  activeChat: Chat | null;
  connection: ConnectionStatus;
  login: (credentials: Credentials) => void;
  logout: () => void;
  openChat: (chatId: string) => void;
  /** Бросает ошибку, если номер не зарегистрирован в MAX */
  createChat: (phone: string) => Promise<void>;
  removeChat: (chatId: string) => void;
  sendText: (text: string) => Promise<void>;
};

export const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat должен использоваться внутри ChatProvider");
  return context;
}
