const API = "http://localhost:8081";
const SESSION_KEY = "chamatrust_session";

/* ── Session helpers ─────────────────────────────────────── */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    // Lightweight expiry check — JWT exp is in seconds
    const payload = JSON.parse(atob(session.token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      clearSession();
      return null;
    }
    return session; // { token, user: { id, email, fullName, phone, walletAddress, role } }
  } catch {
    return null;
  }
}

export function saveSession(token, user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/* ── Register ─────────────────────────────────────────────── */
export async function register({ fullName, email, phone, password }) {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, phone, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  saveSession(data.token, data.user);
  return data;
}

/* ── Login ────────────────────────────────────────────────── */
export async function login({ email, password }) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  saveSession(data.token, data.user);
  return data;
}

/* ── Link wallet to account ───────────────────────────────── */
export async function linkWallet(token, { address, message, signature }) {
  const res = await fetch(`${API}/auth/link-wallet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ address, message, signature }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Wallet linking failed");
  // Update stored session with wallet address
  const session = getSession();
  if (session) saveSession(data.token || token, { ...session.user, walletAddress: address });
  return data;
}

/* ── Demo / offline fallback ──────────────────────────────── */
// If the API is unreachable, create a local-only session so the UI
// still works in development without a running backend.
export async function registerDemo({ fullName, email, phone }) {
  const fakeToken = btoa(JSON.stringify({ sub: email, exp: Math.floor(Date.now() / 1000) + 43200 }))
    + "." + btoa("{}") + ".demo";
  const user = { id: "demo", email, fullName, phone, walletAddress: null, role: "member" };
  saveSession(fakeToken, user);
  return { token: fakeToken, user };
}
