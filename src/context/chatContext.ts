import { createContext } from "react";
import type { Chat, ChatMessage, Credentials } from "../utils/types";

export type ConnectionStatus = "offline" | "connecting" | "online" | "error";

export type Connection = {
  status: ConnectionStatus;
  /** Человекочитаемая причина, если что-то пошло не так */
  detail?: string;
};

export type ChatContextValue = {
  credentials: Credentials;
  isAuthorized: boolean;
  chats: Chat[];
  messages: Record<string, ChatMessage[]>;
  activeChatId: string;
  activeChat: Chat | null;
  connection: Connection;
  login: (credentials: Credentials) => void;
  logout: () => void;
  openChat: (chatId: string) => void;
  createChat: (phone: string) => string;
  removeChat: (chatId: string) => void;
  sendText: (text: string) => Promise<void>;
};

export const ChatContext = createContext<ChatContextValue | null>(null);
