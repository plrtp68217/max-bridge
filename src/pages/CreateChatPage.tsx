import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../hooks/useChat";
import { ROUTES } from "../router/paths";
import { BackIcon } from "../components/ui/Icons";
import "./AuthPage.css";

function CreateChatPage() {
  const { createChat, chats } = useChat();

  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const digits = phone.replace(/\D/g, "");

    // Номер в международном формате: код страны + номер, без плюса
    if (digits.length < 10 || digits.length > 15) {
      setError("Введите номер в международном формате, например 79001234567");
      return;
    }

    setError("");
    createChat(digits);
    navigate(ROUTES.CHAT);
  };

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={handleSubmit}>
        {chats.length > 0 && (
          <button
            type="button"
            className="auth__back"
            onClick={() => navigate(ROUTES.CHAT)}
            aria-label="Назад к чатам"
          >
            <BackIcon />
          </button>
        )}

        <h1 className="auth__title">Новый чат</h1>
        <p className="auth__subtitle">
          Введите номер телефона получателя в международном формате.
        </p>

        <label className="auth__field">
          <span>Номер телефона</span>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="79001234567"
            inputMode="tel"
            autoComplete="off"
            autoFocus
          />
        </label>

        {error && <p className="auth__error">{error}</p>}

        <button type="submit" className="auth__submit">
          Начать чат
        </button>
      </form>
    </main>
  );
}

export default CreateChatPage;
