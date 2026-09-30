import { ChatPanel } from "../components/chat/ChatPanel";
import { NavRail } from "../components/sidebar/NavRail";
import { Sidebar } from "../components/sidebar/Sidebar";
import { useChat } from "../context/chatContext";
import "./ChatPage.css";

function ChatPage() {
  const { logout, activeChat } = useChat();

  // После logout RequireAuth сам перенаправит на /login
  return (
    <div className={`workspace${activeChat ? " workspace--chat-open" : ""}`}>
      <NavRail onLogout={logout} />
      <Sidebar />
      <ChatPanel />
    </div>
  );
}

export default ChatPage;
