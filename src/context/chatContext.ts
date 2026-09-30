import { createContext, useContext } from "react";
import type { Chat, ChatMessage, Credentials } from "../utils/types";

export type ConnectionStatus = "connecting" | "online" | "error";

export type ChatContextValue = {
  isAuthorized: boolean;
  chat: Chat | null;
  messages: ChatMessage[];
  connection: ConnectionStatus;
  login: (credentials: Credentials) => void;
  logout: () => void;
  /** Бросает ошибку, если номер не зарегистрирован в MAX */
  startChat: (phone: string) => Promise<void>;
  sendText: (text: string) => Promise<void>;
};

export const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat должен использоваться внутри ChatProvider");
  return context;
}
