import type { Chat } from "../../utils/types";
import { Avatar } from "../ui/Avatar";
import { BackIcon, PhoneIcon, SearchIcon, VideoIcon } from "../ui/Icons";
import "./ChatHeader.css";

type ChatHeaderProps = {
  chat: Chat;
  subtitle: string;
  onBack: () => void;
};

export function ChatHeader({ chat, subtitle, onBack }: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <button type="button" className="chat-header__back" onClick={onBack} aria-label="К списку чатов">
        <BackIcon />
      </button>

      <Avatar chatId={chat.id} name={chat.name} size={40} />

      <div className="chat-header__info">
        <span className="chat-header__name">{chat.name}</span>
        <span className="chat-header__subtitle">{subtitle}</span>
      </div>

      <div className="chat-header__actions">
        <button type="button" disabled title="Недоступно в демо" aria-label="Позвонить">
          <PhoneIcon size={20} />
        </button>
        <button type="button" disabled title="Недоступно в демо" aria-label="Видеозвонок">
          <VideoIcon size={20} />
        </button>
        <button type="button" disabled title="Недоступно в демо" aria-label="Поиск в чате">
          <SearchIcon size={20} />
        </button>
      </div>
    </header>
  );
}
