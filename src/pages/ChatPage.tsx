import { Navigate, useNavigate } from "react-router-dom";
import { ChatHeader } from "../components/chat/ChatHeader";
import { MessageComposer } from "../components/chat/MessageComposer";
import { MessageList } from "../components/chat/MessageList";
import { useChat } from "../context/chatContext";
import "./ChatPage.css";

const SUBTITLE = {
  connecting: "подключение…",
  online: "в сети",
  error: "нет соединения",
} as const;

function ChatPage() {
  const { chat, messages, connection, sendText, logout } = useChat();
  const navigate = useNavigate();

  if (!chat) return <Navigate to="/create-chat" replace />;

  // После logout RequireAuth сам перенаправит на /login
  return (
    <main className="chat-page">
      <ChatHeader
        chat={chat}
        subtitle={SUBTITLE[connection]}
        onBack={() => navigate("/create-chat")}
        onLogout={logout}
      />

      <MessageList messages={messages} />

      <MessageComposer onSend={(text) => void sendText(text)} />
    </main>
  );
}

export default ChatPage;
