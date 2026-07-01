import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, MessageCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { apiFetch } from "../lib/api";
import "../styles/premium.css";

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Habari! Mimi ni msaidizi wako wa ChamaTrust. Nikusaidie nini leo?" }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMicClick = () => {
    if (isListening) return;
    
    setIsListening(true);
    
    // Simulate user speaking
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: "user", text: "Nimechangia kiasi gani mwezi huu?" }]);
      
      // Simulate AI processing and responding
      setTimeout(() => {
        apiFetch("/ai/voice", {
          method: "POST",
          body: JSON.stringify({ text: "Nimechangia kiasi gani mwezi huu?" })
        })
        .then(res => res.json())
        .then(data => {
          setMessages(prev => [...prev, { sender: "ai", text: data.response }]);
          setIsListening(false);
        })
        .catch(() => {
          setMessages(prev => [...prev, { sender: "ai", text: "Umechangia TZS 80,000 mwezi huu." }]);
          setIsListening(false);
        });
      }, 1000);
    }, 2000); // 2 seconds of "listening"
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
        onClick={() => setIsOpen(true)}
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
              width: "350px",
              height: "500px",
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
                <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>AI Voice Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.sender === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                    background: msg.sender === "user" ? "linear-gradient(135deg, var(--accent-secondary), var(--accent-green))" : "rgba(255,255,255,0.1)",
                    color: "#fff",
                    padding: "12px 16px",
                    borderRadius: "16px",
                    borderBottomRightRadius: msg.sender === "user" ? "4px" : "16px",
                    borderBottomLeftRadius: msg.sender === "ai" ? "4px" : "16px",
                    maxWidth: "80%",
                    fontSize: "0.95rem",
                    lineHeight: "1.4"
                  }}
                >
                  {msg.text}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: "20px", borderTop: "1px solid var(--glass-border)", display: "flex", justifyContent: "center" }}>
              <motion.button
                onClick={handleMicClick}
                animate={isListening ? { scale: [1, 1.2, 1], boxShadow: ["0 0 0 0 rgba(0, 210, 255, 0)", "0 0 0 20px rgba(0, 210, 255, 0.2)", "0 0 0 0 rgba(0, 210, 255, 0)"] } : {}}
                transition={isListening ? { repeat: Infinity, duration: 1.5 } : {}}
                style={{
                  background: isListening ? "var(--accent-green)" : "rgba(255,255,255,0.1)",
                  border: "none",
                  width: "64px",
                  height: "64px",
                  borderRadius: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: isListening ? "#000" : "var(--accent-green)"
                }}
              >
                <Mic size={32} />
              </motion.button>
            </div>
            {isListening && <p style={{ textAlign: "center", margin: "-10px 0 20px 0", fontSize: "0.85rem", color: "var(--accent-green)", fontWeight: 700 }}>Listening...</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
