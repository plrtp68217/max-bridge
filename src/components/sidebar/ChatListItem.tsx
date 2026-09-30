import { formatChatListTime } from "../../utils/format";
import type { Chat, ChatMessage } from "../../utils/types";
import { Avatar } from "../ui/Avatar";
import { MessageTicks } from "../chat/MessageTicks";
import { TrashIcon } from "../ui/Icons";
import "./ChatListItem.css";

type ChatListItemProps = {
  chat: Chat;
  lastMessage?: ChatMessage;
  isActive: boolean;
  onSelect: () => void;
  onRemove: () => void;
};

export function ChatListItem({
  chat,
  lastMessage,
  isActive,
  onSelect,
  onRemove,
}: ChatListItemProps) {
  const preview = lastMessage
    ? `${lastMessage.direction === "outgoing" ? "Вы: " : ""}${lastMessage.text}`
    : "Нет сообщений";

  return (
    <div
      className={`chat-item${isActive ? " chat-item--active" : ""}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-current={isActive}
    >
      <Avatar chatId={chat.id} name={chat.name} />

      <div className="chat-item__body">
        <div className="chat-item__row">
          <span className="chat-item__name">{chat.name}</span>

          <span className="chat-item__meta">
            {lastMessage?.direction === "outgoing" && <MessageTicks status={lastMessage.status} />}
            {lastMessage && (
              <span className="chat-item__time">{formatChatListTime(lastMessage.timestamp)}</span>
            )}
          </span>
        </div>

        <div className="chat-item__row">
          <span className={`chat-item__preview${lastMessage ? "" : " chat-item__preview--empty"}`}>
            {preview}
          </span>

          {chat.unreadCount > 0 && <span className="chat-item__badge">{chat.unreadCount}</span>}
        </div>
      </div>

      <button
        type="button"
        className="chat-item__remove"
        title="Удалить чат"
        aria-label={`Удалить чат ${chat.name}`}
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
      >
        <TrashIcon />
      </button>
    </div>
  );
}
