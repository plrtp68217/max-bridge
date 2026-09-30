import { useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveCredentials } from '../utils/storage';
import { ROUTES } from '../router/paths';

function LoginPage() {

  const [idInstance, SetIdInstance] = useState("310022751170");
  const [apiTokenInstance, SetApiTokenInstance] = useState("c0d61ae899c641debbb692a8c15f9da4f0958662945e40648d");

  const navigate = useNavigate();

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveCredentials({idInstance, apiTokenInstance});
    navigate(ROUTES.CREATE_CHAT);
  }

  return (
    <>
      <main>
        <form onSubmit={handleSubmit}>
          <input
            value={idInstance}
            onChange={(e) => SetIdInstance(e.target.value)}
          />
          <input
            value={apiTokenInstance}
            onChange={(e) => SetApiTokenInstance(e.target.value)}
          />
          <button type="submit">Авторизоваться</button>
        </form>
      </main>
    </>
  )
}

export default LoginPage;