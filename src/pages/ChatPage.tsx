import { useEffect, useState, type SubmitEvent } from "react";
import { loadCredentials, loadChatId } from "../utils/storage";
import { sendMessage } from "../api/greenapi";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../router/paths";

function ChatPage() {
  const navigate = useNavigate();
  const [credentials] = useState(loadCredentials);
  const [chatId] = useState(loadChatId);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!credentials.idInstance || !credentials.apiTokenInstance || !chatId) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [credentials, chatId, navigate]);

  const handleSend = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;

    await sendMessage(credentials, {chatId, message});

    console.log("Отправлено сообщение: " + message + ` [${chatId}]`);
    
    setMessage("");
  }

  return (
    <>
      <form onSubmit={handleSend}>
        <input 
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Введите сообщение"
        />
        <button type="submit">Отправить</button>
      </form>
    </>
  )
}

export default ChatPage;