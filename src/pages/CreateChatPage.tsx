import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { BackIcon } from "../components/ui/Icons";
import { useChat } from "../context/chatContext";
import "./AuthPage.css";

function CreateChatPage() {
  const { startChat, chat } = useChat();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const digits = phone.replace(/\D/g, "");

    if (digits.length < 10 || digits.length > 15) {
      setError("Введите номер в международном формате, например 79001234567");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await startChat(digits);
      navigate("/chat");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось проверить номер");
      setLoading(false);
    }
  };

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={handleSubmit}>
        {chat && (
          <button
            type="button"
            className="auth__back"
            onClick={() => navigate("/chat")}
            aria-label="Назад к чату"
          >
            <BackIcon />
          </button>
        )}

        <h1 className="auth__title">Новый чат</h1>
        <p className="auth__subtitle">Введите номер телефона получателя в международном формате.</p>

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

        <button type="submit" className="auth__submit" disabled={loading}>
          {loading ? "Проверяем номер…" : "Начать чат"}
        </button>
      </form>
    </main>
  );
}

export default CreateChatPage;
