import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../hooks/useChat";
import { ROUTES } from "../router/paths";
import "./AuthPage.css";

function LoginPage() {
  const { credentials, isAuthorized, chats, login } = useChat();

  const [idInstance, setIdInstance] = useState(credentials.idInstance);
  const [apiTokenInstance, setApiTokenInstance] = useState(credentials.apiTokenInstance);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthorized) navigate(chats.length ? ROUTES.CHAT : ROUTES.CREATE_CHAT, { replace: true });
  }, [chats.length, isAuthorized, navigate]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const id = idInstance.trim();
    const token = apiTokenInstance.trim();

    if (!/^\d+$/.test(id)) {
      setError("idInstance состоит только из цифр");
      return;
    }

    if (token.length < 10) {
      setError("Проверьте apiTokenInstance");
      return;
    }

    setError("");
    login({ idInstance: id, apiTokenInstance: token });
  };

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={handleSubmit}>
        <div className="auth__logo" aria-hidden>
          MAX
        </div>

        <h1 className="auth__title">Вход</h1>
        <p className="auth__subtitle">
          Укажите данные инстанса GREEN-API — они сохранятся только в этом браузере.
        </p>

        <label className="auth__field">
          <span>idInstance</span>
          <input
            value={idInstance}
            onChange={(event) => setIdInstance(event.target.value)}
            placeholder="1101000001"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
          />
        </label>

        <label className="auth__field">
          <span>apiTokenInstance</span>
          <input
            value={apiTokenInstance}
            onChange={(event) => setApiTokenInstance(event.target.value)}
            placeholder="d75b3a66374942c5b3c019c698abc2067e151558acbd412345"
            autoComplete="off"
            type="password"
          />
        </label>

        {error && <p className="auth__error">{error}</p>}

        <button type="submit" className="auth__submit">
          Войти
        </button>
      </form>
    </main>
  );
}

export default LoginPage;
