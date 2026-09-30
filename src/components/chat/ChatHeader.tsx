import type { Chat } from "../../utils/types";
import { Avatar } from "../ui/Avatar";
import { BackIcon, LogoutIcon } from "../ui/Icons";
import "./ChatHeader.css";

type ChatHeaderProps = {
  chat: Chat;
  subtitle: string;
  onBack: () => void;
  onLogout: () => void;
};

export function ChatHeader({ chat, subtitle, onBack, onLogout }: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <button
        type="button"
        className="chat-header__button"
        onClick={onBack}
        title="Сменить номер"
        aria-label="Сменить номер"
      >
        <BackIcon />
      </button>

      <Avatar chatId={chat.id} name={chat.name} size={40} />

      <div className="chat-header__info">
        <span className="chat-header__name">{chat.name}</span>
        <span className="chat-header__subtitle">{subtitle}</span>
      </div>

      <button type="button" className="chat-header__button" onClick={onLogout} title="Выйти" aria-label="Выйти">
        <LogoutIcon />
      </button>
    </header>
  );
}
