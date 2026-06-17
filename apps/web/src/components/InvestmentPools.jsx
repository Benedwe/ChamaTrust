import { motion } from "framer-motion";
import { PieChart, TrendingUp, ShieldCheck, ArrowRight } from "lucide-react";
import { investmentPools } from "../data/demoData";
import { formatMoney } from "../lib/format";
import "../styles/premium.css";

const riskColors = {
  Low: "var(--accent-green)",
  Medium: "#f59e0b",
  High: "#ef4444"
};

export function InvestmentPools() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="premium-card"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 className="premium-heading" style={{ margin: 0 }}>
          <PieChart size={28} className="premium-heading-icon" />
          Community Pools
        </h2>
        <span className="premium-badge">Yield Farming</span>
      </div>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px", lineHeight: "1.6" }}>
        Pool funds together to invest in large-scale agricultural projects and earn high-yield returns.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {investmentPools.map((pool) => {
          const filled = (pool.tvl / pool.capacity) * 100;
          return (
            <div key={pool.id} className="premium-list-item" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{pool.name}</h3>
                  <span className="premium-stat-label">{pool.category}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p className="premium-stat-value" style={{ fontSize: "1.25rem", color: "var(--accent-secondary)", margin: 0 }}>
                    {pool.apy}% APY
                  </p>
                  <span style={{ fontSize: "0.75rem", color: riskColors[pool.risk], fontWeight: 800 }}>
                    <ShieldCheck size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "2px" }} />
                    {pool.risk} Risk
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
                <div>
                  <p className="premium-stat-label">TVL (Total Value Locked)</p>
                  <p style={{ fontWeight: 800, margin: "4px 0 0 0" }}>{formatMoney(pool.tvl)}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p className="premium-stat-label">Capacity</p>
                  <p style={{ fontWeight: 800, margin: "4px 0 0 0" }}>{formatMoney(pool.capacity)}</p>
                </div>
              </div>

              <div className="premium-progress-bar">
                <div className="premium-progress-fill" style={{ width: `${filled}%`, background: "linear-gradient(90deg, var(--accent-green), #fff)" }} />
              </div>

              <button className="premium-button" style={{ marginTop: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "none" }}>
                View Pool & Invest <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
