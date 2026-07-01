import { motion } from "framer-motion";
import { Vote, ChevronRight, ShieldCheck, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { proposals } from "../data/demoData";
import { formatMoney } from "../lib/format";
import "../styles/premium.css";

export function GovernanceAi() {
  const [aiScores, setAiScores] = useState({});

  useEffect(() => {
    // Fetch AI credit scores for each proposal
    proposals.forEach(p => {
      apiFetch("/ai/credit-score", {
        method: "POST",
        body: JSON.stringify({ memberId: p.member, amount: p.amount })
      })
      .then(res => res.json())
      .then(data => {
        setAiScores(prev => ({ ...prev, [p.id]: data }));
      })
      .catch(() => {
        setAiScores(prev => ({ ...prev, [p.id]: {
          loanRisk: "Low",
          approvalRecommendation: "Recommended",
          trustScore: 91,
          repaymentProbability: 94,
          reason: "Member has contributed consistently for 8 months and repaid previous loans on time."
        }}));
      });
    });
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 className="premium-heading" style={{ margin: 0 }}>
          <Vote size={28} className="premium-heading-icon" />
          AI-Enhanced Governance
        </h2>
      </div>

      <div className="premium-grid" style={{ gap: "16px" }}>
        {proposals.map((proposal) => {
          const aiData = aiScores[proposal.id];
          return (
            <div key={proposal.id} className="premium-list-item" style={{ flexDirection: "column", alignItems: "stretch", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <span className="premium-stat-label">{proposal.id}</span>
                  <h3 style={{ margin: "4px 0", fontSize: "1.2rem", fontWeight: 800 }}>{proposal.member}</h3>
                  <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>{proposal.purpose}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p className="premium-stat-value" style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-primary)" }}>{formatMoney(proposal.amount)}</p>
                  <span className="premium-stat-label">Requested</span>
                </div>
              </div>

              {/* AI Assessment Panel */}
              {aiData ? (
                <div style={{ background: "rgba(0, 210, 255, 0.05)", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "1px solid rgba(0, 210, 255, 0.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <ShieldCheck size={18} style={{ color: "var(--accent-green)" }} />
                    <span style={{ fontWeight: 700, color: "var(--accent-green)", fontSize: "0.9rem" }}>AI Risk Assessment</span>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div>
                      <p className="premium-stat-label" style={{ fontSize: "0.75rem" }}>Trust Score</p>
                      <p style={{ margin: "4px 0 0 0", fontWeight: 900, fontSize: "1.1rem" }}>{aiData.trustScore}/100</p>
                    </div>
                    <div>
                      <p className="premium-stat-label" style={{ fontSize: "0.75rem" }}>Repayment Prob.</p>
                      <p style={{ margin: "4px 0 0 0", fontWeight: 900, fontSize: "1.1rem" }}>{aiData.repaymentProbability}%</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p className="premium-stat-label" style={{ fontSize: "0.75rem" }}>Recommendation</p>
                      <span className="premium-badge">{aiData.approvalRecommendation}</span>
                    </div>
                  </div>

                  <div style={{ paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <p className="premium-stat-label" style={{ fontSize: "0.75rem", marginBottom: "4px" }}>AI Reasoning</p>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                      {aiData.reason}
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "16px", textAlign: "center", color: "var(--text-secondary)" }}>
                  Running AI Assessment...
                </div>
              )}

              <button className="premium-button" style={{ width: "100%", justifyContent: "center" }}>
                Cast Vote <ChevronRight size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
