import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, ShieldCheck, Sparkles, Users, Eye, EyeOff, AlertCircle, X } from "lucide-react";
import { register, login, registerDemo } from "../lib/auth";
import { checkApiHealth } from "../lib/api";
import "../styles/auth.css";

const FEATURES = [
  { icon: <ShieldCheck size={11} />, label: "Blockchain secured" },
  { icon: <Users size={11} />,      label: "Community finance" },
  { icon: <Sparkles size={11} />,   label: "AI-powered insights" },
];

/* ── Field component ─────────────────────────────────────── */
function Field({ id, label, type = "text", value, onChange, error, placeholder, right }) {
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`auth-input${error ? " error" : ""}`}
          autoComplete={type === "password" ? "current-password" : undefined}
        />
        {right && (
          <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
            {right}
          </div>
        )}
      </div>
      {error && <span className="auth-field-error">{error}</span>}
    </div>
  );
}

/* ── Sign-Up form ─────────────────────────────────────────── */
function SignUpForm({ onSuccess }) {
  const [fullName, setFullName] = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState("");

  function validate() {
    const e = {};
    if (!fullName.trim() || fullName.trim().length < 2) e.fullName = "Enter your full name";
    if (!/\S+@\S+\.\S+/.test(email))                   e.email    = "Enter a valid email address";
    if (!phone.trim() || phone.trim().length < 7)       e.phone    = "Enter a valid phone number";
    if (password.length < 8)                            e.password = "Password must be at least 8 characters";
    if (password !== confirm)                           e.confirm  = "Passwords do not match";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const data = await register({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), password });
      onSuccess(data.token, data.user);
    } catch (err) {
      // If the API is down, fall back to a demo session so UX is still smooth
      if (err.message.includes("fetch") || err.message.includes("network") || err.message.includes("Failed")) {
        const data = await registerDemo({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim() });
        onSuccess(data.token, data.user);
      } else {
        setApiError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {apiError && (
        <div className="auth-error-banner">
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          {apiError}
        </div>
      )}

      <Field id="su-name"  label="Full Name"  value={fullName} onChange={setFullName}
             placeholder="Grace Wanjiku" error={errors.fullName} />

      <div className="auth-row">
        <Field id="su-email" label="Email" type="email" value={email} onChange={setEmail}
               placeholder="you@email.com" error={errors.email} />
        <Field id="su-phone" label="Phone" type="tel" value={phone} onChange={setPhone}
               placeholder="+254 7XX XXX XXX" error={errors.phone} />
      </div>

      <Field
        id="su-password" label="Password" type={showPw ? "text" : "password"}
        value={password} onChange={setPassword}
        placeholder="Min. 8 characters" error={errors.password}
        right={
          <button type="button" onClick={() => setShowPw(v => !v)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", display: "flex" }}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <Field id="su-confirm" label="Confirm Password" type={showPw ? "text" : "password"}
             value={confirm} onChange={setConfirm}
             placeholder="Repeat password" error={errors.confirm} />

      <button type="submit" className="auth-submit" disabled={loading} id="signup-submit-btn">
        {loading ? <span className="auth-spinner" /> : <ShieldCheck size={18} />}
        {loading ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
}

/* ── Sign-In form ─────────────────────────────────────────── */
function SignInForm({ onSuccess }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState("");

  function validate() {
    const e = {};
    if (!/\S+@\S+\.\S+/.test(email)) e.email    = "Enter a valid email address";
    if (!password)                    e.password = "Enter your password";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const data = await login({ email: email.trim(), password });
      onSuccess(data.token, data.user);
    } catch (err) {
      if (err.message.includes("fetch") || err.message.includes("network") || err.message.includes("Failed")) {
        // API offline demo fallback
        const data = await registerDemo({ fullName: email.split("@")[0], email: email.trim(), phone: "" });
        onSuccess(data.token, data.user);
      } else {
        setApiError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {apiError && (
        <div className="auth-error-banner">
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          {apiError}
        </div>
      )}

      <Field id="si-email" label="Email" type="email" value={email} onChange={setEmail}
             placeholder="you@email.com" error={errors.email} />

      <Field
        id="si-password" label="Password" type={showPw ? "text" : "password"}
        value={password} onChange={setPassword}
        placeholder="Your password" error={errors.password}
        right={
          <button type="button" onClick={() => setShowPw(v => !v)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", display: "flex" }}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <button type="submit" className="auth-submit" disabled={loading} id="signin-submit-btn">
        {loading ? <span className="auth-spinner" /> : <Landmark size={18} />}
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}

/* ── Main AuthScreen ──────────────────────────────────────── */
export function AuthScreen({ onAuth, onClose, asModal = false }) {
  const [tab, setTab] = useState("signin");
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    checkApiHealth().then(setApiOnline);
  }, []);

  function handleSuccess(token, user) {
    onAuth(token, user);
  }

  const card = (
    <motion.div
      className="auth-card"
      style={{ position: 'relative', ...(asModal ? { maxWidth: '100%', borderRadius: 24 } : {}) }}
      initial={asModal ? { opacity: 0, scale: 0.96, y: 16 } : { opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      {onClose && (
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', zIndex: 10 }}
        >
          <X size={20} />
        </button>
      )}
      {/* Logo */}
      <div className="auth-logo">
        <div className="auth-logo-icon">
          <Landmark size={22} color="#fff" />
        </div>
        <div className="auth-logo-text">
          <div className="auth-logo-name">ChamaTrust</div>
          <div className="auth-logo-tag">Avalanche-powered community finance</div>
          {apiOnline !== null && (
            <div style={{ fontSize: "11px", marginTop: 4, color: apiOnline ? "#00d26a" : "#fbbf24" }}>
              {apiOnline ? "● API connected" : "● API offline — demo mode available"}
            </div>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="auth-tabs" role="tablist">
        <button
          id="auth-tab-signup"
          role="tab"
          aria-selected={tab === "signup"}
          className={`auth-tab${tab === "signup" ? " active" : ""}`}
          onClick={() => setTab("signup")}
        >
          Create Account
        </button>
        <button
          id="auth-tab-signin"
          role="tab"
          aria-selected={tab === "signin"}
          className={`auth-tab${tab === "signin" ? " active" : ""}`}
          onClick={() => setTab("signin")}
        >
          Sign In
        </button>
      </div>

      {/* Forms */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: tab === "signup" ? -16 : 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: tab === "signup" ? 16 : -16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {tab === "signup"
            ? <SignUpForm onSuccess={handleSuccess} />
            : <SignInForm onSuccess={handleSuccess} />
          }
        </motion.div>
      </AnimatePresence>

      {/* Feature pills */}
      <div className="auth-features">
        {FEATURES.map(f => (
          <div key={f.label} className="auth-feature-pill">
            {f.icon} {f.label}
          </div>
        ))}
      </div>

      {/* Demo hint */}
      <p className="auth-demo-hint">
        No backend running?{" "}
        <button
          id="auth-demo-btn"
          onClick={() =>
            registerDemo({ fullName: "Demo User", email: "demo@chamatrust.io", phone: "+254700000000" })
              .then(d => handleSuccess(d.token, d.user))
          }
        >
          Enter demo mode
        </button>
      </p>
    </motion.div>
  );

  if (asModal) {
    return card;
  }

  return (
    <div className="auth-root">
      {/* Ambient orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />
      <div className="auth-grid" />
      {card}
    </div>
  );
}
