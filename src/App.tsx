import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useChat } from "./context/chatContext";
import ChatPage from "./pages/ChatPage";
import CreateChatPage from "./pages/CreateChatPage";
import LoginPage from "./pages/LoginPage";

/** Пускает дальше только при сохранённых idInstance и apiTokenInstance. */
function RequireAuth() {
  return useChat().isAuthorized ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/create-chat" element={<CreateChatPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
}

export default App;
