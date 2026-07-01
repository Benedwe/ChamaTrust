import { motion } from "framer-motion";
import { BrainCircuit, Activity, TrendingUp, AlertTriangle, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import "../styles/premium.css";

export function AiInsights() {
  const [health, setHealth] = useState(null);
  const [coach, setCoach] = useState(null);
  const [fraud, setFraud] = useState(null);

  useEffect(() => {
    apiFetch("/ai/health")
      .then((data) => setHealth(data))
      .catch(() => setHealth({
        treasuryHealth: "Strong",
        currentBalance: 3200000,
        activeLoans: 1100000,
        defaultRisk: "Low",
        recommendation: "The group can safely approve up to 1,000,000 TZS in new loans."
      }));

    apiFetch("/ai/coach", {
      method: "POST",
      body: JSON.stringify({ memberName: "Benjamin" })
    })
      .then((data) => setCoach(data))
      .catch(() => setCoach({
        message: "You contributed 50,000 TZS this month.\n\nAt your current rate, you could accumulate 600,000 TZS within 12 months.\n\nSuggested contribution: 65,000 TZS monthly."
      }));

    apiFetch("/ai/fraud-check", { method: "POST" })
      .then((data) => setFraud(data))
      .catch(() => setFraud({
        alert: "Member has submitted 4 loan requests within 14 days.",
        riskLevel: "High",
        recommendation: "Review manually before approval."
      }));
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-grid" style={{ gap: "24px" }}>
      
      {/* Financial Health Analyzer */}
      <div className="premium-card">
        <h2 className="premium-heading">
          <Activity size={28} className="premium-heading-icon" />
          Chama Health Analyzer
        </h2>
        {health && (
          <div style={{ marginTop: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <span className="premium-stat-label">Treasury Health</span>
              <span className="premium-badge" style={{ background: "rgba(0, 210, 255, 0.2)", color: "var(--accent-green)" }}>{health.treasuryHealth}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <span className="premium-stat-label">Default Risk</span>
              <span className="premium-badge">{health.defaultRisk}</span>
            </div>
            <div className="premium-list-item" style={{ background: "rgba(255,255,255,0.05)" }}>
              <BrainCircuit size={20} style={{ color: "var(--accent-secondary)", marginRight: "12px" }} />
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-primary)" }}>{health.recommendation}</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Savings Coach */}
      <div className="premium-card">
        <h2 className="premium-heading">
          <TrendingUp size={28} className="premium-heading-icon" />
          AI Savings Coach
        </h2>
        {coach && (
          <div style={{ marginTop: "24px" }}>
             <p className="premium-stat-label" style={{ marginBottom: "16px" }}>Personalized Advice for Benjamin</p>
             <div className="premium-list-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
               {coach.message.split("\n\n").map((para, i) => (
                 <p key={i} style={{ margin: 0, fontSize: "0.95rem", lineHeight: "1.5" }}>{para}</p>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* Fraud Detection */}
      <div className="premium-card" style={{ border: "1px solid rgba(239, 68, 68, 0.3)" }}>
        <h2 className="premium-heading" style={{ background: "linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)", WebkitBackgroundClip: "text" }}>
          <AlertTriangle size={28} style={{ color: "#ef4444", marginRight: "12px" }} />
          AI Fraud Detection
        </h2>
        {fraud && (
          <div style={{ marginTop: "24px" }}>
            <div className="premium-list-item" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <span className="premium-stat-label" style={{ color: "#fca5a5" }}>Alert</span>
                <span className="premium-badge" style={{ background: "#ef4444", color: "#fff", border: "none" }}>Risk: {fraud.riskLevel}</span>
              </div>
              <p style={{ margin: 0, fontWeight: 700, color: "#fff" }}>{fraud.alert}</p>
              <div style={{ marginTop: "8px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)", width: "100%" }}>
                <span className="premium-stat-label" style={{ color: "#fca5a5", display: "block", marginBottom: "4px" }}>Recommendation</span>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>{fraud.recommendation}</p>
              </div>
            </div>
          </div>
        )}
      </div>

    </motion.div>
  );
}
