import { useChat } from "../../hooks/useChat";
import { ChatsIcon } from "../ui/Icons";
import { ChatHeader } from "./ChatHeader";
import { MessageComposer } from "./MessageComposer";
import { MessageList } from "./MessageList";
import "./ChatPanel.css";

const SUBTITLE = {
  offline: "нет подключения",
  connecting: "подключение…",
  online: "в сети",
  error: "нет соединения",
} as const;

export function ChatPanel() {
  const { activeChat, messages, sendText, connection, openChat } = useChat();

  if (!activeChat) {
    return (
      <section className="chat-panel chat-panel--empty">
        <div className="chat-panel__stub">
          <ChatsIcon size={30} />
          <p>Выберите чат или создайте новый</p>
        </div>
      </section>
    );
  }

  return (
    <section className="chat-panel">
      <ChatHeader
        chat={activeChat}
        subtitle={connection.detail ?? SUBTITLE[connection.status]}
        onBack={() => openChat("")}
      />

      <MessageList messages={messages[activeChat.id] ?? []} />

      <MessageComposer onSend={(text) => void sendText(text)} />
    </section>
  );
}
