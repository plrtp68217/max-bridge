import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../hooks/useChat";
import { ROUTES } from "../../router/paths";
import { toPhone } from "../../utils/format";
import { PlusIcon, SearchIcon } from "../ui/Icons";
import { ChatListItem } from "./ChatListItem";
import "./Sidebar.css";

const CONNECTION_LABEL = {
  offline: "Не подключено",
  connecting: "Подключение…",
  online: "На связи",
  error: "Нет соединения",
} as const;

export function Sidebar() {
  const { chats, messages, activeChatId, openChat, removeChat, connection } = useChat();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const visibleChats = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return chats;

    const digits = normalized.replace(/\D/g, "");

    return chats.filter(
      (chat) =>
        chat.name.toLowerCase().includes(normalized) ||
        (digits.length > 0 && toPhone(chat.id).includes(digits)),
    );
  }, [chats, query]);

  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <h1 className="sidebar__title">Чаты</h1>

        <span className={`sidebar__status sidebar__status--${connection.status}`}>
          <i />
          {CONNECTION_LABEL[connection.status]}
        </span>

        <button
          type="button"
          className="sidebar__add"
          onClick={() => navigate(ROUTES.CREATE_CHAT)}
          title="Новый чат"
          aria-label="Новый чат"
        >
          <PlusIcon />
        </button>
      </header>

      <div className="sidebar__search">
        <SearchIcon className="sidebar__search-icon" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Найти"
          aria-label="Поиск по чатам"
        />
      </div>

      <div className="sidebar__list">
        {visibleChats.map((chat) => {
          const list = messages[chat.id];

          return (
            <ChatListItem
              key={chat.id}
              chat={chat}
              lastMessage={list?.[list.length - 1]}
              isActive={chat.id === activeChatId}
              onSelect={() => openChat(chat.id)}
              onRemove={() => removeChat(chat.id)}
            />
          );
        })}

        {visibleChats.length === 0 && (
          <p className="sidebar__empty">
            {chats.length === 0 ? "Чатов пока нет. Начните новый." : "Ничего не найдено"}
          </p>
        )}
      </div>
    </aside>
  );
}
