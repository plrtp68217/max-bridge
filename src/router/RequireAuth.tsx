import { Navigate, Outlet } from "react-router-dom";
import { useChat } from "../hooks/useChat";
import { ROUTES } from "./paths";

/** Пускает дальше только при сохранённых idInstance и apiTokenInstance. */
export function RequireAuth() {
  const { isAuthorized } = useChat();

  return isAuthorized ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
}
