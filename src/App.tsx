import { ChatProvider } from "./context/ChatProvider";
import { AppRouter } from "./router/AppRouter";

function App() {
  return (
    <ChatProvider>
      <AppRouter />
    </ChatProvider>
  );
}

export default App;
