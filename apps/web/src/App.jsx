import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownToLine,
  BadgeCheck,
  Banknote,
  BellRing,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Landmark,
  LineChart as LineChartIcon,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Vote,
  WalletCards,
  X,
  XCircle
} from "lucide-react";
import { Card } from "./components/Card";
import { ContributionHeatmap, LoanPerformanceChart, SavingsChart, TreasuryPie } from "./components/DashboardCharts";
import { FlowRail } from "./components/FlowRail";
import { MetricCard } from "./components/MetricCard";
import { contributors, group, momoProviders, proposals, transactions } from "./data/demoData";
import { compactNumber, formatMoney } from "./lib/format";
import { connectWallet, isCoreInstalled, CORE_INSTALL_URL } from "./lib/wallet";
import { AgriFinance } from "./components/AgriFinance";
import { InvestmentPools } from "./components/InvestmentPools";
import { AiInsights } from "./components/AiInsights";
import { GovernanceAi } from "./components/GovernanceAi";
import { MeetingSummarizer } from "./components/MeetingSummarizer";
import { VoiceAssistant } from "./components/VoiceAssistant";
import { CreateChamaModal } from "./components/CreateChamaModal";
import "./styles/premium.css";

/** Truncates a wallet address: 0x1234...abcd */
function truncateAddress(addr) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/** Auto-dismissing toast notification */
function WalletToast({ status, address, error, onDismiss }) {
  useEffect(() => {
    if (status === "connected") {
      const t = setTimeout(onDismiss, 5000);
      return () => clearTimeout(t);
    }
  }, [status, onDismiss]);

  return (
    <AnimatePresence>
      {status !== "idle" && (
        <motion.div
          key="wallet-toast"
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          style={{
            position: "fixed",
            top: "80px",
            right: "20px",
            zIndex: 9999,
            minWidth: "280px",
            maxWidth: "380px",
            borderRadius: "14px",
            padding: "16px 18px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            backdropFilter: "blur(16px)",
            border: status === "connected"
              ? "1px solid rgba(0, 210, 110, 0.35)"
              : status === "error"
              ? "1px solid rgba(239, 68, 68, 0.35)"
              : "1px solid rgba(255,255,255,0.12)",
            background: status === "connected"
              ? "rgba(0, 30, 20, 0.85)"
              : status === "error"
              ? "rgba(40, 10, 10, 0.88)"
              : "rgba(15, 20, 30, 0.85)",
          }}
        >
          {status === "connecting" && (
            <Loader2 size={20} style={{ color: "#60a5fa", flexShrink: 0, marginTop: 2, animation: "spin 1s linear infinite" }} />
          )}
          {status === "connected" && (
            <CheckCircle2 size={20} style={{ color: "#00d26a", flexShrink: 0, marginTop: 2 }} />
          )}
          {status === "error" && (
            <XCircle size={20} style={{ color: "#ef4444", flexShrink: 0, marginTop: 2 }} />
          )}
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: "14px", color: "#fff", margin: 0 }}>
              {status === "connecting" && "Connecting Core wallet…"}
              {status === "connected" && "Core wallet connected! ✓"}
              {status === "error" && "Connection failed"}
            </p>
            {status === "connected" && address && (
              <p style={{ fontSize: "12px", color: "#00d26a", marginTop: 4, fontFamily: "monospace", fontWeight: 600 }}>
                {truncateAddress(address)}
              </p>
            )}
            {status === "error" && error && (
              <p style={{ fontSize: "12px", color: "#fca5a5", marginTop: 4 }}>{error}</p>
            )}
          </div>
          <button
            onClick={onDismiss}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "rgba(255,255,255,0.5)", flexShrink: 0 }}
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ChamaSuccessToast({ show, name, onDismiss }) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onDismiss, 5000);
      return () => clearTimeout(t);
    }
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          style={{
            position: "fixed",
            top: "80px",
            right: "20px",
            zIndex: 9999,
            minWidth: "280px",
            maxWidth: "380px",
            borderRadius: "14px",
            padding: "16px 18px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(0, 210, 110, 0.35)",
            background: "rgba(0, 30, 20, 0.85)",
          }}
        >
          <CheckCircle2 size={20} style={{ color: "#00d26a", flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: "14px", color: "#fff", margin: 0 }}>
              Chama Created Successfully! ✓
            </p>
            <p style={{ fontSize: "12px", color: "#00d26a", marginTop: 4, fontWeight: 600 }}>
              {name}
            </p>
          </div>
          <button
            onClick={onDismiss}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "rgba(255,255,255,0.5)", flexShrink: 0 }}
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const ussdCodes = {
  "M-Pesa": "*150*00#",
  "Airtel Money": "*150*60#",
  "Tigo Pesa": "*150*01#",
  "HaloPesa": "*150*88#"
};

const demoWalletAddress = "0x8f23aB38Ff09D6F2a9A59b2F2e156a601E06339A";
const demoWalletNetwork = "Avalanche Fuji Demo";

const ussdSteps = {
  "M-Pesa": [
    "Dial *150*00#",
    "Select 4 for Payment",
    "Enter Paybill number 888999",
    "Enter your Chama Trust ID as account",
    "Enter amount you want to deposit",
    "Enter PIN to confirm"
  ],
  "Airtel Money": [
    "Dial *150*60#",
    "Select 5 for Make Payments",
    "Select 4 for Pay Bill",
    "Enter business number 888999",
    "Enter your Chama Trust ID as account",
    "Enter amount and PIN"
  ],
  "Tigo Pesa": [
    "Dial *150*01#",
    "Select 4 for Pay Bill",
    "Enter business number 888999",
    "Enter your Chama Trust ID as account",
    "Enter amount and PIN"
  ],
  "HaloPesa": [
    "Dial *150*88#",
    "Select 4 for Pay Bill",
    "Enter business number 888999",
    "Enter your Chama Trust ID as account",
    "Enter amount and PIN"
  ]
};

function App() {
  const [provider, setProvider] = useState("M-Pesa");
  const [activeFlow, setActiveFlow] = useState("deposit");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [wallet, setWallet] = useState(null);          // null = not connected, string = real address
  const [walletNetwork, setWalletNetwork] = useState(null); // e.g. "Avalanche Fuji C-Chain"
  const [walletStatus, setWalletStatus] = useState("idle"); // idle | connecting | connected | error
  const [walletError, setWalletError] = useState("");
  const [coreInstalled, setCoreInstalled] = useState(true); // assume true until checked
  const [showUssdInstructions, setShowUssdInstructions] = useState(false);
  const [isCreateChamaOpen, setIsCreateChamaOpen] = useState(false);
  const [createdChamaName, setCreatedChamaName] = useState("");
  const monthlyPercent = useMemo(() => Math.round((group.balance / group.contributionTarget) * 100), []);

  // Detect Core wallet on mount
  useEffect(() => {
    setCoreInstalled(isCoreInstalled());
  }, []);

  async function handleWallet() {
    if (wallet) return; // already connected — do nothing

    // If Core isn't installed, send user to install page
    if (!isCoreInstalled()) {
      window.open(CORE_INSTALL_URL, "_blank", "noopener,noreferrer");
      setCoreInstalled(false);
      return;
    }

    setWalletStatus("connecting");
    setWalletError("");
    try {
      const session = await connectWallet();
      if (!session?.address) throw new Error("No address returned from Core wallet.");
      setWallet(session.address);
      setWalletNetwork(session.network);
      setWalletStatus("connected");
    } catch (err) {
      let msg = err?.message || "Could not connect Core wallet. Please try again.";
      // Friendly message for the CORE_NOT_INSTALLED sentinel
      if (msg === "CORE_NOT_INSTALLED") {
        msg = "Avalanche Core wallet not detected. Please install Core to continue.";
        setCoreInstalled(false);
      }
      // User rejected the request
      if (err?.code === 4001) msg = "Connection rejected. Please approve the request in Core wallet.";
      setWalletError(msg);
      setWalletStatus("error");
      setWallet(null);
    }
  }

  function dismissToast() {
    setWalletStatus("idle");
    setWalletError("");
  }

  function handleDemoWallet() {
    setWallet(demoWalletAddress);
    setWalletNetwork(demoWalletNetwork);
    setWalletStatus("connected");
    setWalletError("");
  }

  const handleDepositClick = () => {
    if (!wallet) {
      setWalletStatus("error");
      setWalletError("Connect Core or use the demo wallet to preview a deposit.");
      return;
    }
    if (activeFlow === "deposit") {
      setShowUssdInstructions(true);
    }
  };

  return (
    <main className="mesh min-h-screen text-white">
      {/* Wallet status toast */}
      <WalletToast
        status={walletStatus}
        address={wallet}
        error={walletError}
        onDismiss={dismissToast}
      />
      <ChamaSuccessToast 
        show={!!createdChamaName} 
        name={createdChamaName} 
        onDismiss={() => setCreatedChamaName("")} 
      />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 phone-safe md:px-6 lg:px-8">
        <header className="sticky top-0 z-20 -mx-4 border-b border-white/50 bg-paper/75 px-4 py-3 backdrop-blur-xl md:static md:mx-0 md:border-none md:bg-transparent md:px-0 text-ink">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-mint shadow-lg">
                <Landmark size={21} />
              </div>
              <div>
                <p className="text-lg font-extrabold" style={{ color: "#00d2ff", fontWeight: 900 }}>ChamaTrust</p>
                <p className="text-xs font-semibold text-slate-500">Avalanche-powered community finance</p>
              </div>
            </div>

            {/* ── Avalanche Core wallet button ── */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <div className="flex items-center gap-2">
              {!wallet && (
                <button
                  onClick={handleDemoWallet}
                  className="hidden min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-ink shadow-sm sm:flex"
                  title="Use a simulated Fuji wallet for demo mode"
                >
                  <Sparkles size={15} />
                  Demo wallet
                </button>
              )}
              <button
                id="wallet-connect-btn"
                onClick={handleWallet}
                disabled={walletStatus === "connecting" || !!wallet}
                title={
                  wallet
                    ? `Connected on ${walletNetwork}: ${wallet}`
                    : !coreInstalled
                    ? "Install Avalanche Core wallet"
                    : "Connect Avalanche Core wallet"
                }
                className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold text-white shadow-lg"
                style={{
                  background: wallet
                    ? "linear-gradient(135deg, #003d1f 0%, #00522a 100%)"
                    : !coreInstalled
                    ? "linear-gradient(135deg, #e84142 0%, #b91c1c 100%)"
                    : walletStatus === "error"
                    ? "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)"
                    : "linear-gradient(135deg, #e84142 0%, #c0392b 100%)",  /* Avalanche red */
                  border: wallet
                    ? "1px solid rgba(0,210,110,0.45)"
                    : !coreInstalled
                    ? "1px solid rgba(232,65,66,0.5)"
                    : walletStatus === "error"
                    ? "1px solid rgba(239,68,68,0.4)"
                    : "1px solid rgba(232,65,66,0.4)",
                  cursor: wallet ? "default" : walletStatus === "connecting" ? "wait" : "pointer",
                  transition: "all 0.25s ease",
                  minWidth: "148px",
                }}
              >
                {walletStatus === "connecting" ? (
                  <Loader2 size={15} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
                ) : wallet ? (
                  /* Glowing green connected dot */
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#00d26a",
                    boxShadow: "0 0 8px #00d26a, 0 0 2px #00d26a",
                    flexShrink: 0,
                    display: "inline-block",
                  }} />
                ) : (
                  /* Core "A" triangle mark (SVG) */
                  <svg width="15" height="15" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M16 3 L30 28 H2 Z" fill="white" opacity="0.9" />
                  </svg>
                )}
                <span className="hidden sm:inline">
                  {walletStatus === "connecting"
                    ? "Connecting…"
                    : wallet
                    ? truncateAddress(wallet)
                    : !coreInstalled
                    ? "Install Core"
                    : "Connect Core"}
                </span>
              </button>
              </div>

              {/* Avalanche network badge — only shown when connected */}
              {wallet && walletNetwork && (
                <span style={{
                  fontSize: "10px", fontWeight: 700, letterSpacing: "0.04em",
                  color: "#00d26a", background: "rgba(0,210,106,0.1)",
                  border: "1px solid rgba(0,210,106,0.25)",
                  borderRadius: "6px", padding: "2px 8px",
                }}>
                  ⬡ {walletNetwork}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="premium-tabs" style={{ marginTop: "24px" }}>
          {["Dashboard", "Agri-Finance", "Investment Pools", "AI Insights", "Governance", "Meetings"].map((tab) => (
            <div 
              key={tab} 
              className={`premium-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>

        {activeTab === "Agri-Finance" && (
          <section className="grid gap-4 py-5 md:grid-cols-2">
            <AgriFinance />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card">
              <h2 className="premium-heading">Why Agri-Loans?</h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                Our agricultural loans are specifically designed to empower farmers with timely access to seeds, fertilizers, and equipment.
              </p>
            </motion.div>
          </section>
        )}

        {activeTab === "Investment Pools" && (
          <section className="grid gap-4 py-5 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <InvestmentPools />
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card">
              <h2 className="premium-heading">Your Portfolio</h2>
              <div style={{ textAlign: "center", margin: "32px 0" }}>
                <p className="premium-stat-label">Total Invested</p>
                <p className="premium-stat-value" style={{ fontSize: "2.5rem", color: "var(--accent-green)" }}>$0.00</p>
              </div>
            </motion.div>
          </section>
        )}

        {activeTab === "AI Insights" && (
          <section className="py-5">
            <AiInsights />
          </section>
        )}

        {activeTab === "Governance" && (
          <section className="py-5">
            <GovernanceAi />
          </section>
        )}

        {activeTab === "Meetings" && (
          <section className="py-5">
            <MeetingSummarizer />
          </section>
        )}

        {activeTab === "Dashboard" && (
          <div className="text-ink">
            <section className="grid gap-4 py-5 lg:grid-cols-[1.08fr_0.92fr] lg:py-8">
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-ink p-5 text-white shadow-fintech premium-card" style={{ background: "var(--glass-bg)" }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-mint">{group.name}</p>
                <h1 className="mt-2 max-w-2xl text-4xl font-black leading-tight md:text-6xl">
                  Save, vote, borrow, and grow together.
                </h1>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/10 p-3 text-right">
                <p className="text-xs font-semibold text-emerald-100">Trust Score</p>
                <p className="text-3xl font-black text-mint">{group.healthScore}/100</p>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50 md:text-base">
              Members use familiar Mobile Money flows while treasury actions settle transparently through Avalanche.
            </p>
            <div className="mt-6 grid grid-cols-4 gap-2">
              {["Join", "Deposit", "Vote"].map((action) => (
                <button key={action} className="rounded-lg bg-white px-3 py-3 text-sm font-extrabold text-ink">
                  {action}
                </button>
              ))}
              <button 
                onClick={() => setIsCreateChamaOpen(true)}
                className="rounded-lg bg-mint px-3 py-3 text-sm font-extrabold text-ink flex items-center justify-center gap-1"
              >
                Create ✚
              </button>
            </div>
          </motion.div>

          <Card className="flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500">Treasury Balance</p>
                <p className="mt-1 text-4xl font-black">{formatMoney(group.balance)}</p>
                <p className="mt-1 text-sm text-slate-600">{group.stableBalance.toLocaleString()} cUSD equivalent on Fuji</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-mint text-ink">
                <ShieldCheck size={23} />
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm font-semibold">
                <span>Monthly contribution goal</span>
                <span>{monthlyPercent}%</span>
              </div>
              <div className="h-3 rounded-full bg-emerald-100">
                <motion.div
                  className="h-3 rounded-full bg-canopy"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(monthlyPercent, 100)}%` }}
                  transition={{ duration: 1.2 }}
                />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-white/70 p-3">
                <p className="text-xl font-black">{group.activeMembers}</p>
                <p className="text-xs font-semibold text-slate-500">Members</p>
              </div>
              <div className="rounded-lg bg-white/70 p-3">
                <p className="text-xl font-black">{group.pendingVotes}</p>
                <p className="text-xs font-semibold text-slate-500">Votes</p>
              </div>
              <div className="rounded-lg bg-white/70 p-3">
                <p className="text-xl font-black">{group.repaymentRate}%</p>
                <p className="text-xs font-semibold text-slate-500">Repay</p>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={CircleDollarSign} label="Monthly Growth" value={`+${group.monthlyGrowth}%`} detail="Savings increased compared with last month." tone="bg-mint text-ink" />
          <MetricCard icon={Users} label="Active Members" value={group.activeMembers} detail="24 members contributed in the last 7 days." tone="bg-lagoon text-ink" />
          <MetricCard icon={Vote} label="Pending Votes" value={group.pendingVotes} detail="Two loan proposals are near quorum." tone="bg-berry text-white" />
          <MetricCard icon={LockKeyhole} label="Security" value="MFA On" detail="Wallet signatures and risk checks enabled." tone="bg-sunrise text-ink" />
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_380px]">
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-black">Savings Growth</h2>
              <LineChartIcon size={20} />
            </div>
            <SavingsChart />
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">Mobile Money Bridge</h2>
              <Banknote size={20} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {["deposit", "withdraw"].map((flow) => (
                <button
                  key={flow}
                  onClick={() => {
                    setActiveFlow(flow);
                    setShowUssdInstructions(false);
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-bold capitalize ${activeFlow === flow ? "bg-ink text-white" : "bg-white/70 text-ink"}`}
                >
                  {flow}
                </button>
              ))}
            </div>
            <select
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
              className="mt-3 w-full rounded-lg border border-emerald-100 bg-white px-3 py-3 text-sm font-bold outline-none"
            >
              {momoProviders.map((item) => <option key={item}>{item}</option>)}
            </select>
            {!showUssdInstructions ? (
              <>
                <FlowRail direction={activeFlow} provider={provider} />
                <button 
                  onClick={activeFlow === "deposit" ? handleDepositClick : undefined}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-canopy px-4 py-3 font-extrabold text-white">
                  {activeFlow === "deposit" ? <ArrowDownToLine size={18} /> : <Banknote size={18} />}
                  {activeFlow === "deposit" ? "Deposit funds" : "Request withdrawal"}
                </button>
              </>
            ) : (
              <div className="mt-4 rounded-lg border border-emerald-100 bg-white/70 p-4 text-ink shadow-sm">
                <h3 className="mb-2 text-lg font-black text-canopy">USSD Instructions</h3>
                <p className="mb-3 text-sm font-semibold">
                  Dialing <strong className="text-mint">{ussdCodes[provider]}</strong> on your phone...
                </p>
                <ol className="mb-4 space-y-2 pl-5 text-sm font-medium text-slate-700 list-decimal">
                  {ussdSteps[provider].map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
                <div className="flex gap-2">
                  <a 
                    href={`tel:${ussdCodes[provider].replace(/#/g, "%23")}`} 
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-mint px-4 py-3 font-extrabold text-ink"
                  >
                    Dial Now
                  </a>
                  <button 
                    onClick={() => setShowUssdInstructions(false)}
                    className="flex-1 rounded-lg bg-slate-200 px-4 py-3 font-extrabold text-slate-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </Card>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black">Governance And Loans</h2>
              <Vote size={20} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="rounded-lg bg-white/75 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-500">{proposal.id}</p>
                      <h3 className="text-lg font-black">{proposal.member}</h3>
                      <p className="text-sm text-slate-600">{proposal.purpose}</p>
                    </div>
                    <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-extrabold text-canopy">{proposal.risk}</span>
                  </div>
                  <p className="mt-4 text-2xl font-black">{formatMoney(proposal.amount)}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded bg-emerald-50 p-2"><b>{proposal.approved}</b><p className="text-xs">Approved</p></div>
                    <div className="rounded bg-rose-50 p-2"><b>{proposal.rejected}</b><p className="text-xs">Rejected</p></div>
                    <div className="rounded bg-cyan-50 p-2"><b>{proposal.needed}</b><p className="text-xs">Needed</p></div>
                  </div>
                  <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-3 py-3 text-sm font-extrabold text-white">
                    Vote now <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">ChamaTrust Advisor</h2>
              <Sparkles size={20} />
            </div>
            <div className="mt-4 rounded-lg bg-ink p-4 text-white">
              <p className="text-sm text-emerald-50">Your group has increased savings by {group.monthlyGrowth}% this month.</p>
              <p className="mt-3 text-lg font-black text-mint">Recommendation</p>
              <p className="mt-1 text-sm text-emerald-50">Increase minimum contributions by 10% and keep emergency reserves above 8%.</p>
            </div>
            <div className="mt-3 space-y-2">
              {["Low default risk", "Two members need reminders", "Quorum likely in 6 hours"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg bg-white/70 p-3 text-sm font-semibold">
                  <BellRing size={16} className="text-canopy" />
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card>
            <h2 className="mb-3 text-lg font-black">Treasury Mix</h2>
            <TreasuryPie />
          </Card>
          <Card>
            <h2 className="mb-3 text-lg font-black">Contribution Heatmap</h2>
            <ContributionHeatmap />
          </Card>
          <Card>
            <h2 className="mb-3 text-lg font-black">Loan Performance</h2>
            <LoanPerformanceChart />
          </Card>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[380px_1fr]">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">Contribution Rankings</h2>
              <Trophy size={20} />
            </div>
            <div className="mt-3 space-y-3">
              {contributors.map((member, index) => (
                <div key={member.name} className="flex items-center gap-3 rounded-lg bg-white/70 p-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-canopy font-black text-white">{index + 1}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold">{member.name}</p>
                    <p className="truncate text-xs font-semibold text-slate-500">{member.badge}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black">{compactNumber(member.amount)}</p>
                    <p className="text-xs font-bold text-canopy">{member.score}/100</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">Transaction Explorer</h2>
              <BadgeCheck size={20} />
            </div>
            <div className="mt-3 overflow-hidden rounded-lg bg-white/70">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="grid grid-cols-[1fr_auto] gap-3 border-b border-emerald-50 p-4 last:border-0 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
                  <p className="font-mono text-xs font-bold text-slate-600">{transaction.id}</p>
                  <p className="hidden text-sm font-semibold md:block">{transaction.rail}</p>
                  <p className="hidden text-sm font-semibold md:block">{transaction.type}</p>
                  <p className="hidden text-sm font-black md:block">{formatMoney(transaction.amount)}</p>
                  <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-extrabold text-canopy">{transaction.status}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
          </div>
        )}
      </div>
      <VoiceAssistant />
      <CreateChamaModal 
        isOpen={isCreateChamaOpen} 
        onClose={() => setIsCreateChamaOpen(false)} 
        onSuccess={(chama) => {
          setIsCreateChamaOpen(false);
          setCreatedChamaName(chama.name);
        }} 
      />
    </main>
  );
}

export default App;
