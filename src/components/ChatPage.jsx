import { useState, useEffect, useRef } from "react";
import api from "../api";
import { io } from "socket.io-client";

function ChatPage({ user, setUser }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const socket = useRef(null);
  const receiverRef = useRef(receiver);
  const messagesEndRef = useRef(null); // ref for auto-scroll

  // Keep latest receiver in ref
  useEffect(() => {
    receiverRef.current = receiver;
  }, [receiver]);

  // Connect socket and fetch user + contacts
  useEffect(() => {
    socket.current = io("http://localhost:5000");

    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(res.data);
        setContacts(res.data.contacts || []);
        socket.current.emit("register", res.data._id);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();

    socket.current.on("receiveMessage", ({ senderId, content, senderName }) => {
      if (!receiverRef.current || senderId !== receiverRef.current._id) return;

      setMessages((prev) => [
        ...prev,
        { sender: { _id: senderId, username: senderName || "Unknown" }, content },
      ]);
    });

    return () => {
      socket.current.disconnect();
    };
  }, [token]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Search users
  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      const res = await api.get(`/users/search?username=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
      alert("Search failed");
    }
  };

  // Load messages with a specific user
  const loadMessages = async (userId) => {
    try {
      const res = await api.get(`/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load messages");
    }
  };

  // Add a user to contacts
  const addContact = async (userToAdd) => {
    try {
      await api.post(
        "/users/add",
        { userId: userToAdd._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContacts((prev) => [...prev, userToAdd]);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add contact");
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!receiver || !message.trim()) return;

    try {
      const res = await api.post(
        "/messages/send",
        { receiverId: receiver._id, content: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) => [...prev, res.data]);

      socket.current.emit("sendMessage", {
        senderId: res.data.sender._id,
        senderName: res.data.sender.username,
        receiverId: receiver._id,
        content: message,
      });

      setMessage("");
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
    }
  };

  // Logout
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">
          Welcome, {currentUser ? currentUser.username : user}
        </h2>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* Search bar */}
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 flex-1 rounded-l"
        />
        <button
          onClick={handleSearch}
          className="bg-gray-600 text-white px-3 rounded-r"
        >
          Search
        </button>
      </div>

      {/* Contacts list */}
      {contacts.length > 0 ? (
        <div className="mb-4 border p-2 rounded">
          <h3 className="font-semibold mb-2">Contacts:</h3>
          {contacts.map((c) => (
            <button
              key={c._id}
              onClick={() => {
                setReceiver(c);
                loadMessages(c._id);
              }}
              className="block w-full text-left p-2 hover:bg-gray-200 rounded"
            >
              {c.username}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mb-4">No contacts yet. Search and add some!</p>
      )}

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="mb-4 border p-2 rounded">
          <h3 className="font-semibold mb-2">Results:</h3>
          {searchResults.map((u) => (
            <button
              key={u._id}
              onClick={() => {
                setReceiver(u);
                setSearchResults([]);
                loadMessages(u._id);
                if (!contacts.find((c) => c._id === u._id)) {
                  addContact(u);
                }
              }}
              className="block w-full text-left p-2 hover:bg-gray-200 rounded"
            >
              {u.username}
            </button>
          ))}
        </div>
      )}

      {/* Chat messages */}
      {receiver && (
        <>
          <h3 className="font-semibold mb-2">
            Chat with <span className="text-blue-500">{receiver.username}</span>
          </h3>
          <div className="border h-64 overflow-y-auto p-2 mb-4 bg-gray-50">
            {messages.map((m) => {
              const senderName = m.sender?.username || "Unknown";
              return (
                <div
                  key={m._id || Math.random()}
                  className={`mb-2 ${
                    senderName === (currentUser?.username || user)
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  <span
                    className={`inline-block p-2 rounded ${
                      senderName === (currentUser?.username || user)
                        ? "bg-blue-200"
                        : "bg-gray-200"
                    }`}
                  >
                    {senderName}: {m.content}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Send message form */}
          <form onSubmit={sendMessage} className="flex">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 border p-2 rounded-l"
            />
            <button className="bg-blue-500 text-white px-4 rounded-r">
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default ChatPage;
