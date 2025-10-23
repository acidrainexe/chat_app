import { useState } from "react";
import api from "../api";

function LoginSignup({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const res = await api.post(endpoint, { username, password });

      if (isLogin) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.username);
        setUser(res.data.username);
      } else {
        alert("Signup successful! You can now log in.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-md w-80">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {isLogin ? "Login" : "Sign Up"}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border w-full p-2 mb-2 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border w-full p-2 mb-4 rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600 transition"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 ml-1 underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginSignup;
