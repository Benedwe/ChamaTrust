import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, MessageCircle, Send, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { apiFetch } from "../lib/api";
import "../styles/premium.css";

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! I'm your ChamaTrust AI Advisor. Ask me anything about your chama — savings, loans, treasury health, or governance. I'm here to help!" }
  ]);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userText = text.trim();
    setInputText("");
    setMessages(prev => [...prev, { sender: "user", text: userText }]);
    setIsLoading(true);

    try {
      const data = await apiFetch("/ai/voice", {
        method: "POST",
        body: JSON.stringify({ text: userText })
      });
      setMessages(prev => [...prev, { sender: "ai", text: data.response }]);
    } catch {
      setMessages(prev => [...prev, {
        sender: "ai",
        text: "I'm having trouble connecting right now. Please try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser. Please type your question.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = "en-GB";

    recog.onstart = () => setIsListening(true);

    recog.onresult = (event) => {
      const spokenText = event.results[0][0].transcript.trim();
      setIsListening(false);
      if (spokenText) sendMessage(spokenText);
    };

    recog.onerror = () => setIsListening(false);
    recog.onend = () => setIsListening(false);

    recog.start();
    recognitionRef.current = recog;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="premium-button"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "60px",
          height: "60px",
          borderRadius: "30px",
          padding: 0,
          zIndex: 50,
          boxShadow: "0 8px 32px rgba(0, 210, 255, 0.4)"
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(v => !v)}
      >
        <MessageCircle size={28} />
      </motion.button>

      {/* Voice Assistant Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              position: "fixed",
              bottom: "100px",
              right: "24px",
              width: "360px",
              height: "520px",
              background: "var(--bg-dark)",
              borderRadius: "24px",
              border: "1px solid var(--glass-border)",
              boxShadow: "0 16px 64px rgba(0,0,0,0.5)",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}
          >
            {/* Header */}
            <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.05)", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Mic size={20} style={{ color: "var(--accent-green)" }} />
                <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>AI Advisor</span>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.sender === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                    background: msg.sender === "user"
                      ? "linear-gradient(135deg, var(--accent-secondary), var(--accent-green))"
                      : "rgba(255,255,255,0.1)",
                    color: "#fff",
                    padding: "10px 14px",
                    borderRadius: "16px",
                    borderBottomRightRadius: msg.sender === "user" ? "4px" : "16px",
                    borderBottomLeftRadius: msg.sender === "ai" ? "4px" : "16px",
                    maxWidth: "85%",
                    fontSize: "0.88rem",
                    lineHeight: "1.5",
                    whiteSpace: "pre-wrap"
                  }}
                >
                  {msg.text}
                </motion.div>
              ))}
              {isLoading && (
                <div style={{ alignSelf: "flex-start", display: "flex", gap: "6px", padding: "10px 14px", background: "rgba(255,255,255,0.1)", borderRadius: "16px", borderBottomLeftRadius: "4px" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.5)", animation: "pulse 1.2s ease-in-out infinite" }} />
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.5)", animation: "pulse 1.2s ease-in-out 0.2s infinite" }} />
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.5)", animation: "pulse 1.2s ease-in-out 0.4s infinite" }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--glass-border)", display: "flex", gap: "8px", alignItems: "flex-end" }}>
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your chama…"
                rows={1}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  color: "#fff",
                  fontSize: "0.88rem",
                  outline: "none",
                  resize: "none",
                  maxHeight: "80px",
                  overflowY: "auto",
                  fontFamily: "inherit"
                }}
              />
              <button
                onClick={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isLoading}
                style={{
                  background: "linear-gradient(135deg, var(--accent-secondary), var(--accent-green))",
                  border: "none",
                  borderRadius: "12px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  opacity: (!inputText.trim() || isLoading) ? 0.4 : 1,
                  flexShrink: 0
                }}
              >
                {isLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} color="#fff" />}
              </button>
              <motion.button
                onClick={handleMicClick}
                animate={isListening ? { scale: [1, 1.15, 1] } : {}}
                transition={isListening ? { repeat: Infinity, duration: 1 } : {}}
                style={{
                  background: isListening ? "var(--accent-green)" : "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: "12px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: isListening ? "#000" : "var(--accent-green)",
                  flexShrink: 0
                }}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
