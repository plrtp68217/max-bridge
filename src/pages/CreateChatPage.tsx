import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { saveChatId } from "../utils/storage";
import { ROUTES } from "../router/paths";

function CreateChatPage() {
  const PHONE_POSTFIX = "@c.us";

  const [phoneNumber, SetPhoneNumber] = useState("79208036508");

  const navigate = useNavigate();

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      saveChatId(phoneNumber + PHONE_POSTFIX);
      navigate(ROUTES.CHAT);
    }

  return (
    <>
      <main>
        <form onSubmit={handleSubmit}>
          <input
            value={phoneNumber}
            onChange={(e) => SetPhoneNumber(e.target.value)}
          />
          
          <button type="submit">Авторизоваться</button>
        </form>
      </main>
    </>
  )
}

export default CreateChatPage;