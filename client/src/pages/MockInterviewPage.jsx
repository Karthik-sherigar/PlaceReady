import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./MockInterviewPage.css";

const MockInterviewPage = () => {
  const [interviewId, setInterviewId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, in-progress, completed

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startInterview = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/interview/chat",
        { type: "technical" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInterviewId(res.data.interviewId);
      setMessages(res.data.messages);
      setStatus(res.data.status);
    } catch (err) {
      console.error(err);
      alert("Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (msgOverride) => {
    const textToSend = msgOverride || input;
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { role: "user", content: textToSend }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/interview/chat",
        { interviewId, message: textToSend },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data.messages);
      setStatus(res.data.status);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 429) {
        alert("AI quota exceeded. Please wait 30 seconds before sending another message.");
      } else {
        alert("Failed to send message. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (status === "idle") {
    return (
      <div className="interview-page">
        <div className="interview-header">
          <h1 className="interview-title">Mock Interview</h1>
          <p className="interview-subtitle">Practice your interviewing skills with an AI recruiter.</p>
        </div>
        <div className="interview-setup">
          <h2>Technical Interview</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
            The AI will ask you technical questions based on your target role. Treat this as a real interview.
          </p>
          <button className="start-btn" onClick={startInterview} disabled={loading}>
            {loading ? "Preparing..." : "Start Interview"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-page">
      <div className="interview-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="interview-title">Technical Mock Interview</h1>
          <p className="interview-subtitle">
            {status === "completed" ? "Interview Completed. See feedback below." : "AI is interviewing you now."}
          </p>
        </div>
        {status === "in-progress" && (
          <button className="end-interview-btn" onClick={() => sendMessage("End Interview")} disabled={loading}>
            End Interview
          </button>
        )}
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.filter(m => m.role !== "system").map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role}`}>
              {msg.content}
            </div>
          ))}
          {loading && <div className="chat-message model">Typing...</div>}
          <div ref={messagesEndRef} />
        </div>
        
        {status === "in-progress" && (
          <div className="chat-input-container">
            <input 
              type="text" 
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer here..."
              disabled={loading}
            />
            <button className="send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterviewPage;
