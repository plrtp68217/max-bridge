import { useNavigate } from "react-router-dom";
import { ChatPanel } from "../components/chat/ChatPanel";
import { NavRail } from "../components/sidebar/NavRail";
import { Sidebar } from "../components/sidebar/Sidebar";
import { useChat } from "../hooks/useChat";
import { ROUTES } from "../router/paths";
import "./ChatPage.css";

function ChatPage() {
  const { logout, activeChatId } = useChat();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <div className={`workspace${activeChatId ? " workspace--chat-open" : ""}`}>
      <NavRail onLogout={handleLogout} />
      <Sidebar />
      <ChatPanel />
    </div>
  );
}

export default ChatPage;
