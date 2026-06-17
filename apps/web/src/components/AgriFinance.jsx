import { motion } from "framer-motion";
import { Sprout, Tractor, Droplets, ChevronRight } from "lucide-react";
import { agriLoans } from "../data/demoData";
import { formatMoney } from "../lib/format";
import "../styles/premium.css";

const iconMap = {
  "Seed & Fertilizer": <Sprout size={24} className="premium-heading-icon" />,
  "Tractor Lease": <Tractor size={24} className="premium-heading-icon" />,
  "Irrigation Kit": <Droplets size={24} className="premium-heading-icon" />
};

export function AgriFinance() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card"
    >
      <h2 className="premium-heading">
        <Sprout size={28} className="premium-heading-icon" />
        Agricultural Financing
      </h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "24px", lineHeight: "1.6" }}>
        Access customized loan products for your farming needs. Lower interest rates for cooperative members.
      </p>

      <div className="premium-grid" style={{ gap: "16px", marginBottom: "32px" }}>
        {agriLoans.map((loan) => (
          <div key={loan.id} className="premium-list-item" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "12px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                {iconMap[loan.type]}
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{loan.type}</h3>
                  <span className="premium-stat-label">For {loan.farmer}</span>
                </div>
              </div>
              <span className="premium-badge">{loan.status}</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: "8px" }}>
              <div>
                <p className="premium-stat-value" style={{ fontSize: "1.25rem" }}>{formatMoney(loan.amount)}</p>
                <p className="premium-stat-label">Duration: {loan.duration}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p className="premium-stat-value" style={{ fontSize: "1.1rem", color: "var(--accent-green)" }}>{loan.progress}%</p>
                <p className="premium-stat-label">Repaid</p>
              </div>
            </div>

            <div className="premium-progress-bar">
              <div className="premium-progress-fill" style={{ width: `${loan.progress}%` }} />
            </div>
          </div>
        ))}
      </div>

      <button className="premium-button" style={{ width: "100%" }}>
        Apply for Agri-Loan <ChevronRight size={18} />
      </button>
    </motion.div>
  );
}
