import { Navigate, Route, Routes } from "react-router-dom";
import ChatPage from "../pages/ChatPage";
import CreateChatPage from "../pages/CreateChatPage";
import LoginPage from "../pages/LoginPage";
import { ROUTES } from "./paths";
import { RequireAuth } from "./RequireAuth";

export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route path={ROUTES.CREATE_CHAT} element={<CreateChatPage />} />
        <Route path={ROUTES.CHAT} element={<ChatPage />} />
      </Route>

      <Route path="/" element={<Navigate to={ROUTES.CHAT} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.CHAT} replace />} />
    </Routes>
  );
}
