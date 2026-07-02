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
  Trophy,
  Users,
  Vote,
  WalletCards,
  X,
  XCircle,
  Sparkles,
  LogIn
} from "lucide-react";
import { Card } from "./components/Card";
import { ContributionHeatmap, LoanPerformanceChart, SavingsChart, TreasuryPie } from "./components/DashboardCharts";
import { FlowRail } from "./components/FlowRail";
import { MetricCard } from "./components/MetricCard";
import { contributors, group, momoProviders, proposals, transactions } from "./data/demoData";
import { compactNumber, formatMoney } from "./lib/format";
import {
  connectWallet,
  getAvailableWallets,
  isAnyWalletInstalled,
  signApprovalMessage,
  reconnectWallet,
  disconnectWallet
} from "./lib/wallet";
import { WalletPicker } from "./components/WalletPicker";
import { AgriFinance } from "./components/AgriFinance";
import { InvestmentPools } from "./components/InvestmentPools";
import { AiInsights } from "./components/AiInsights";
import { GovernanceAi } from "./components/GovernanceAi";
import { MeetingSummarizer } from "./components/MeetingSummarizer";
import { VoiceAssistant } from "./components/VoiceAssistant";
import { CreateChamaModal } from "./components/CreateChamaModal";
import { JoinChamaModal } from "./components/JoinChamaModal";
import { AuthScreen } from "./components/AuthScreen";
import { InviteMembersModal } from "./components/InviteMembersModal";
import { getSession, clearSession, linkWallet } from "./lib/auth";
import { apiFetch } from "./lib/api";
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
              {status === "connecting" && "Connecting wallet…"}
              {status === "connected" && "Wallet connected! ✓"}
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

const checkoutSteps = {
  Pesapal: [
    "Open the Pesapal checkout page in your browser.",
    "Enter the amount and your mobile number to complete the payment.",
    "Confirm payment and wait for the confirmation message."
  ]
};

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
  const [walletInstalled, setWalletInstalled] = useState(true);
  const [showWalletPicker, setShowWalletPicker] = useState(false);
  const [connectedWalletName, setConnectedWalletName] = useState(null);
  const [showUssdInstructions, setShowUssdInstructions] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState(1000);
  const [transactionPhone, setTransactionPhone] = useState("");
  const [transactionResult, setTransactionResult] = useState(null);
  const [transactionError, setTransactionError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pollReference, setPollReference] = useState(null);
  const [reconciliationStatus, setReconciliationStatus] = useState("");
  const [isCreateChamaOpen, setIsCreateChamaOpen] = useState(false);
  const [isJoinChamaOpen, setIsJoinChamaOpen] = useState(false);
  const [createdChamaName, setCreatedChamaName] = useState("");
  const [inviteChamaId, setInviteChamaId] = useState(null);
  const [session, setSession] = useState(getSession);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  // Live data fetched from API
  const [liveChamas, setLiveChamas] = useState([]);
  const [liveLoans, setLiveLoans] = useState([]);
  const [liveTransactions, setLiveTransactions] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const monthlyPercent = useMemo(() => Math.round((group.balance / group.contributionTarget) * 100), []);

  useEffect(() => {
    setWalletInstalled(isAnyWalletInstalled());
    
    // Auto-reconnect previously connected wallet (browser session)
    reconnectWallet().then((result) => {
      if (result?.address) {
        setWallet(result.address);
        setWalletNetwork(result.network);
        setConnectedWalletName(result.walletName);
        setWalletStatus("connected");
      }
    });
  }, []);

  // When the user logs in and their account has a linked wallet address,
  // silently try to reconnect that wallet from the browser.
  useEffect(() => {
    if (!session?.user?.walletAddress || wallet) return;

    reconnectWallet().then((result) => {
      if (result?.address &&
          result.address.toLowerCase() === session.user.walletAddress.toLowerCase()) {
        setWallet(result.address);
        setWalletNetwork(result.network);
        setConnectedWalletName(result.walletName);
        setWalletStatus("connected");
      }
    }).catch(() => {
      // Reconnect failed silently — user can manually connect
    });
  }, [session?.user?.walletAddress]);

  // Fetch live dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      setDashboardLoading(true);
      try {
        const [chamasRes, loansRes] = await Promise.all([
          apiFetch("/chamas").catch(() => null),
          apiFetch("/loans").catch(() => null),
        ]);
        if (chamasRes?.chamas) setLiveChamas(chamasRes.chamas);
        if (loansRes?.loans) setLiveLoans(loansRes.loans);
      } catch (err) {
        console.warn("Dashboard fetch failed, using demo data:", err.message);
      } finally {
        setDashboardLoading(false);
      }
    }
    fetchDashboardData();
  }, [session]);

  useEffect(() => {
    if (!pollReference || !transactionResult) return;
    if (!["initiated", "prompted"].includes(transactionResult.transaction?.status)) return;

    const interval = setInterval(async () => {
      try {
        const statusResponse = await apiFetch(`/transactions/${encodeURIComponent(pollReference)}`);
        if (statusResponse?.transaction) {
          const currentStatus = statusResponse.transaction.status;
          if (currentStatus !== transactionResult.transaction.status) {
            setTransactionResult((prev) => prev ? {
              ...prev,
              transaction: { ...prev.transaction, status: currentStatus }
            } : prev);
          }

          if (["confirmed", "failed", "settled"].includes(currentStatus)) {
            setReconciliationStatus(
              currentStatus === "confirmed"
                ? "Payment confirmed by webhook."
                : "Payment failed or declined during reconciliation."
            );
            setPollReference(null);
          }
        }
      } catch (err) {
        console.warn("Reconciliation polling error", err);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [pollReference, transactionResult]);

  async function connectSelectedWallet(walletId) {
    setShowWalletPicker(false);
    setWalletStatus("connecting");
    setWalletError("");
    try {
      const result = await connectWallet(walletId);
      if (!result?.address) throw new Error("No address returned from wallet.");
      setWallet(result.address);
      setWalletNetwork(result.network);
      setConnectedWalletName(result.walletName);
      setWalletStatus("connected");

      const currentSession = getSession();
      if (currentSession?.token && !currentSession.user?.walletAddress) {
        try {
          await linkWallet(currentSession.token, {
            address: result.address,
            message: result.message,
            signature: result.signature,
          });
          setSession(getSession());
        } catch {
          // Wallet connected locally even if backend link fails
        }
      }
    } catch (err) {
      let msg = err?.message || "Could not connect wallet. Please try again.";
      if (msg === "NO_WALLET_INSTALLED") {
        msg = "No Web3 wallet detected. Install MetaMask or Core to continue.";
        setWalletInstalled(false);
      }
      if (msg === "MULTIPLE_WALLETS") {
        setShowWalletPicker(true);
        setWalletStatus("idle");
        return;
      }
      if (err?.code === 4001) msg = "Connection rejected. Please approve the request in your wallet.";
      setWalletError(msg);
      setWalletStatus("error");
      setWallet(null);
    }
  }

  function handleWallet() {
    if (wallet) {
      disconnectWallet();
      setWallet(null);
      setWalletStatus("idle");
      setConnectedWalletName(null);
      return;
    }

    setShowWalletPicker(true);
  }

  function dismissToast() {
    setWalletStatus("idle");
    setWalletError("");
  }

  const handleTransactionClick = async () => {
    if (!session?.token) {
      setIsAuthOpen(true);
      setTransactionError("Please log in to deposit or withdraw funds.");
      return;
    }

    // Require wallet for both deposit and withdrawal
    if (!wallet) {
      setTransactionError("Connect your wallet first to deposit or withdraw funds.");
      return;
    }

    if (!transactionAmount || Number(transactionAmount) <= 0) {
      setTransactionError("Enter a valid amount.");
      return;
    }

    if (!transactionPhone || transactionPhone.length < 8) {
      setTransactionError("Enter a valid phone number.");
      return;
    }

    setIsProcessing(true);
    setTransactionError("");
    setTransactionResult(null);
    setReconciliationStatus("");

    try {
      const payload = { provider, phone: transactionPhone, amount: Number(transactionAmount) };

      if (activeFlow === "withdraw") {
        const approvalMessage = `Approve withdrawal of ${payload.amount} via ${provider} for ChamaTrust at ${new Date().toISOString()}`;
        payload.approvalTxHash = await signApprovalMessage(approvalMessage);
      }

      const response = await apiFetch(`/mobile-money/${activeFlow === "deposit" ? "deposit" : "withdraw"}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify(payload)
      });

      setTransactionResult(response);
      setPollReference(response.transaction?.reference || null);
      setShowUssdInstructions(activeFlow === "deposit");

      if (activeFlow === "deposit" && response.mobileMoney?.paymentUrl) {
        window.open(response.mobileMoney.paymentUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      setTransactionError(error.message || "Failed to initiate transaction.");
      setPollReference(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="mesh min-h-screen text-white">
      <AnimatePresence>
        {isAuthOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(6,13,24,0.88)", backdropFilter: "blur(12px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setIsAuthOpen(false); }}
          >
            <motion.div
              initial={{ scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              style={{ width: "100%", maxWidth: 500 }}
              onClick={(e) => e.stopPropagation()}
            >
              <AuthScreen
                onAuth={(token, user) => {
                  setSession({ token, user });
                  setIsAuthOpen(false);
                }}
                onClose={() => setIsAuthOpen(false)}
                asModal
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      <AnimatePresence>
        {showWalletPicker && (
          <WalletPicker
            wallets={getAvailableWallets()}
            onSelect={connectSelectedWallet}
            onClose={() => setShowWalletPicker(false)}
          />
        )}
      </AnimatePresence>

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 phone-safe md:px-6 lg:px-8">
        <header className="sticky top-0 z-20 -mx-4 border-b border-ink/10 bg-paper/95 px-4 py-3 backdrop-blur-xl md:static md:mx-0 md:border-none md:bg-transparent md:px-0 text-ink">
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
              {session ? (
                <button
                  onClick={() => {
                    clearSession();
                    setSession(null);
                    disconnectWallet();
                    setWallet(null);
                    setWalletStatus("idle");
                    setConnectedWalletName(null);
                  }}
                  className="flex min-h-10 items-center gap-2 rounded-lg border border-ink/15 bg-ink/5 px-3 text-sm font-bold text-ink shadow-sm hover:bg-ink/10 md:border-white/20 md:bg-white/5 md:text-white md:hover:bg-white/10"
                >
                  Log Out ({session.user.fullName.split(' ')[0]})
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex min-h-10 items-center gap-2 rounded-lg border border-ink/15 bg-ink px-3 text-sm font-bold text-white shadow-sm hover:bg-ink/90 md:border-mint/30 md:bg-mint md:text-ink md:hover:bg-mint/90"
                >
                  <LogIn size={15} />
                  Login
                </button>
              )}
              <button
                id="wallet-connect-btn"
                onClick={handleWallet}
                disabled={walletStatus === "connecting"}
                title={
                  wallet
                    ? `Connected via ${connectedWalletName || "wallet"} on ${walletNetwork}: ${wallet}. Click to disconnect.`
                    : !walletInstalled
                    ? "Install a Web3 wallet (MetaMask, Core, etc.)"
                    : "Connect your Web3 wallet"
                }
                className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold text-white shadow-lg"
                style={{
                  background: wallet
                    ? "linear-gradient(135deg, #003d1f 0%, #00522a 100%)"
                    : !walletInstalled
                    ? "linear-gradient(135deg, #475569 0%, #334155 100%)"
                    : walletStatus === "error"
                    ? "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)"
                    : "linear-gradient(135deg, #e84142 0%, #c0392b 100%)",
                  border: wallet
                    ? "1px solid rgba(0,210,110,0.45)"
                    : !walletInstalled
                    ? "1px solid rgba(100,116,139,0.5)"
                    : walletStatus === "error"
                    ? "1px solid rgba(239,68,68,0.4)"
                    : "1px solid rgba(232,65,66,0.4)",
                  cursor: walletStatus === "connecting" ? "wait" : "pointer",
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
                  <WalletCards size={15} style={{ flexShrink: 0 }} />
                )}
                <span className="hidden sm:inline">
                  {walletStatus === "connecting"
                    ? "Connecting…"
                    : wallet
                    ? truncateAddress(wallet)
                    : !walletInstalled
                    ? "Install Wallet"
                    : "Connect Wallet"}
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
            {!session ? (
              <div className="mt-5 flex flex-col sm:flex-row flex-wrap gap-3">
                <button
                  id="hero-login-btn"
                  onClick={() => setIsAuthOpen(true)}
                  className="flex w-full sm:w-auto justify-center items-center gap-2 rounded-lg bg-mint px-5 py-3 text-sm font-extrabold text-ink shadow-lg hover:bg-mint/90"
                  style={{ boxShadow: "0 0 24px rgba(0,210,110,0.4)" }}
                >
                  <LogIn size={16} />
                  Login / Sign Up — It's Free
                </button>
                <button
                  onClick={handleWallet}
                  disabled={walletStatus === "connecting"}
                  className="flex w-full sm:w-auto justify-center items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-5 py-3 text-sm font-extrabold text-white hover:bg-white/15"
                >
                  <WalletCards size={16} />
                  {wallet ? truncateAddress(wallet) : "Connect Wallet"}
                </button>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2">
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00d26a", boxShadow: "0 0 8px #00d26a", display: "inline-block" }} />
                <span className="text-sm font-bold text-emerald-200">Signed in as {session.user?.fullName?.split(" ")[0]}</span>
              </div>
            )}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                id="hero-join-btn"
                onClick={() => { if (!session) { setIsAuthOpen(true); } else { setIsJoinChamaOpen(true); } }}
                className="rounded-lg bg-white px-3 py-3 text-sm font-extrabold text-ink hover:bg-white/90 transition-colors"
              >
                Join
              </button>
              <button
                id="hero-deposit-btn"
                onClick={() => {
                  if (!session) { setIsAuthOpen(true); }
                  else { setActiveTab("Dashboard"); document.getElementById("mobile-money-card")?.scrollIntoView({ behavior: "smooth" }); }
                }}
                className="rounded-lg bg-white px-3 py-3 text-sm font-extrabold text-ink hover:bg-white/90 transition-colors"
              >
                Deposit
              </button>
              <button
                id="hero-vote-btn"
                onClick={() => { if (!session) { setIsAuthOpen(true); } else { setActiveTab("Governance"); } }}
                className="rounded-lg bg-white px-3 py-3 text-sm font-extrabold text-ink hover:bg-white/90 transition-colors"
              >
                Vote
              </button>
              <button
                id="hero-create-btn"
                onClick={() => { if (!session) { setIsAuthOpen(true); } else { setIsCreateChamaOpen(true); } }}
                className="rounded-lg bg-mint px-3 py-3 text-sm font-extrabold text-ink flex items-center justify-center gap-1 hover:bg-mint/90 transition-colors"
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

          <Card id="mobile-money-card">
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
                    setTransactionResult(null);
                    setTransactionError("");
                    setReconciliationStatus("");
                    setPollReference(null);
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
            <div className="mt-4 grid gap-3">
              <label className="text-sm font-bold text-slate-700">Amount</label>
              <input
                type="number"
                value={transactionAmount}
                onChange={(event) => setTransactionAmount(event.target.value)}
                className="rounded-lg border border-emerald-100 bg-white px-3 py-3 text-sm font-bold outline-none"
                placeholder="Enter amount"
              />
              <label className="text-sm font-bold text-slate-700">Phone number</label>
              <input
                type="tel"
                value={transactionPhone}
                onChange={(event) => setTransactionPhone(event.target.value)}
                className="rounded-lg border border-emerald-100 bg-white px-3 py-3 text-sm font-bold outline-none"
                placeholder="e.g. +254700000000"
              />
            </div>
            {!showUssdInstructions ? (
              <>
                <FlowRail direction={activeFlow} provider={provider} />

                {/* Step 1: Must be logged in */}
                {!session && (
                  <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3 text-center">
                    <p className="text-xs font-bold text-cyan-300">Log in to send real transactions</p>
                    <button
                      onClick={() => setIsAuthOpen(true)}
                      className="mt-2 rounded-lg bg-mint px-4 py-2 text-xs font-extrabold text-ink hover:bg-mint/90"
                    >
                      Login / Sign Up
                    </button>
                  </div>
                )}

                {/* Step 2: Logged in but no wallet */}
                {session && !wallet && (
                  <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-center">
                    <p className="text-xs font-bold text-amber-300">Connect your wallet to deposit or withdraw</p>
                    <button
                      onClick={() => setShowWalletPicker(true)}
                      className="mt-2 rounded-lg bg-amber-400 px-4 py-2 text-xs font-extrabold text-ink hover:bg-amber-300"
                    >
                      Connect Wallet
                    </button>
                  </div>
                )}

                <button
                  onClick={handleTransactionClick}
                  disabled={isProcessing || !session || !wallet}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-canopy px-4 py-3 font-extrabold text-white disabled:opacity-40 disabled:cursor-not-allowed">
                  {activeFlow === "deposit" ? <ArrowDownToLine size={18} /> : <Banknote size={18} />}
                  {isProcessing ? `${activeFlow === "deposit" ? "Starting deposit…" : "Requesting withdrawal…"}` : activeFlow === "deposit" ? "Deposit funds" : "Request withdrawal"}
                </button>
                {transactionError && (
                  <p className="mt-3 text-sm font-semibold text-rose-600">{transactionError}</p>
                )}
                {transactionResult && (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-900">
                    <p className="font-bold">
                      {activeFlow === "deposit" ? "Deposit request created." : "Withdrawal request created."}
                    </p>
                    <p className="text-sm">Provider: {transactionResult.transaction.provider}</p>
                    <p className="text-sm">Reference: {transactionResult.transaction.reference}</p>
                    <p className="text-sm">Status: {transactionResult.transaction.status}</p>
                    {transactionResult.mobileMoney?.paymentUrl && activeFlow === "deposit" && (
                      <a
                        href={transactionResult.mobileMoney.paymentUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mt-2 inline-flex rounded-lg bg-mint px-3 py-2 text-sm font-bold text-ink"
                      >
                        Continue to Pesapal checkout
                      </a>
                    )}
                    {activeFlow === "withdraw" && transactionResult.mobileMoney?.message && (
                      <p className="mt-2 text-sm text-slate-700">{transactionResult.mobileMoney.message}</p>
                    )}
                    {reconciliationStatus && (
                      <p className="mt-3 text-sm font-semibold text-slate-700">{reconciliationStatus}</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="mt-4 rounded-lg border border-emerald-100 bg-white/70 p-4 text-ink shadow-sm">
                <h3 className="mb-2 text-lg font-black text-canopy">USSD Instructions</h3>
                {provider === "Pesapal" ? (
                  <>
                    <p className="mb-3 text-sm font-semibold">
                      Pesapal uses a secure online checkout instead of USSD.
                    </p>
                    <ol className="mb-4 space-y-2 pl-5 text-sm font-medium text-slate-700 list-decimal">
                      {checkoutSteps.Pesapal.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowUssdInstructions(false)}
                        className="flex-1 rounded-lg bg-slate-200 px-4 py-3 font-extrabold text-slate-700"
                      >
                        Close
                      </button>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            )}
          </Card>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black">Governance And Loans</h2>
              <div className="flex items-center gap-2">
                {dashboardLoading && <Loader2 size={14} className="animate-spin text-slate-400" />}
                <Vote size={20} />
              </div>
            </div>
            {liveLoans.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {liveLoans.slice(0, 4).map((loan) => (
                  <div key={loan._id} className="rounded-lg bg-white/75 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-500">{loan.proposalId || loan._id?.slice(-6)}</p>
                        <h3 className="text-lg font-black">{loan.borrower?.slice(0, 8) || "Member"}…</h3>
                        <p className="text-sm text-slate-600">{loan.purpose}</p>
                      </div>
                      <span className={`rounded-lg px-2 py-1 text-xs font-extrabold ${
                        loan.riskLevel === "Low" ? "bg-emerald-100 text-canopy" :
                        loan.riskLevel === "High" ? "bg-rose-100 text-rose-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>{loan.riskLevel || "Medium"}</span>
                    </div>
                    <p className="mt-4 text-2xl font-black">{formatMoney(loan.amount)}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded bg-emerald-50 p-2"><b>{loan.votes?.filter(v => v.support).length || 0}</b><p className="text-xs">Approved</p></div>
                      <div className="rounded bg-rose-50 p-2"><b>{loan.votes?.filter(v => !v.support).length || 0}</b><p className="text-xs">Rejected</p></div>
                      <div className="rounded bg-cyan-50 p-2"><b>{loan.status}</b><p className="text-xs">Status</p></div>
                    </div>
                    <button
                      onClick={() => { if (!session) { setIsAuthOpen(true); } else { setActiveTab("Governance"); } }}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-3 py-3 text-sm font-extrabold text-white"
                    >
                      {session ? <><span>Vote now</span> <ChevronRight size={16} /></> : <><LogIn size={14} /><span>Login to Vote</span></>}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
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
                    <button
                      onClick={() => { if (!session) { setIsAuthOpen(true); } else { setActiveTab("Governance"); } }}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-3 py-3 text-sm font-extrabold text-white"
                    >
                      {session ? <><span>Vote now</span> <ChevronRight size={16} /></> : <><LogIn size={14} /><span>Login to Vote</span></>}
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                <div key={transaction.id} className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-emerald-50 p-4 last:border-0 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
                  <p className="font-mono text-xs font-bold text-slate-600">{transaction.id}</p>
                  <p className="hidden text-sm font-semibold md:block">{transaction.rail}</p>
                  <p className="hidden text-sm font-semibold md:block">{transaction.type}</p>
                  <p className="text-sm font-black text-right md:text-left">{formatMoney(transaction.amount)}</p>
                  <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-extrabold text-canopy text-center">{transaction.status}</span>
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
          setInviteChamaId(chama._id);
          // Refresh live chamas list after creation
          apiFetch("/chamas").then(r => { if (r?.chamas) setLiveChamas(r.chamas); }).catch(() => {});
        }}
        onLoginRequest={() => setIsAuthOpen(true)}
      />
      <JoinChamaModal
        isOpen={isJoinChamaOpen}
        onClose={() => setIsJoinChamaOpen(false)}
        onSuccess={(chama) => {
          setIsJoinChamaOpen(false);
          setCreatedChamaName(`Joined ${chama.name}!`);
        }}
        onLoginRequest={() => setIsAuthOpen(true)}
      />
      <InviteMembersModal
        chamaId={inviteChamaId}
        onClose={() => setInviteChamaId(null)}
      />
    </main>
  );
}

export default App;
