import { useState } from "react";
import LoginSignup from "./components/LoginSignup";
import ChatPage from "./components/ChatPage";

function App() {
  const [user, setUser] = useState(localStorage.getItem("username"));

  return user ? (
    <ChatPage user={user} setUser={setUser} />
  ) : (
    <LoginSignup setUser={setUser} />
  );
}

export default App;

