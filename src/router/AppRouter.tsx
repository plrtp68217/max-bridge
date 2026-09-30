import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import CreateChatPage from "../pages/CreateChatPage";
import ChatPage from "../pages/ChatPage";
import { ROUTES } from "./paths";

export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.CREATE_CHAT} element={<CreateChatPage />} />
      <Route path={ROUTES.CHAT} element={<ChatPage />} />
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
}