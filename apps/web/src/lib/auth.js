import { API_BASE_URL } from "./config.js";

const SESSION_KEY = "chamatrust_session";

/* ── Session helpers ─────────────────────────────────────── */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    const payload = JSON.parse(atob(session.token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      clearSession();
      return null;
    }
    return session;
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

async function authFetch(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

/* ── Register ─────────────────────────────────────────────── */
export async function register({ fullName, email, phone, password }) {
  const data = await authFetch("/auth/register", { fullName, email, phone, password });
  saveSession(data.token, data.user);
  return data;
}

/* ── Login ────────────────────────────────────────────────── */
export async function login({ email, password }) {
  const data = await authFetch("/auth/login", { email, password });
  saveSession(data.token, data.user);
  return data;
}

/* ── Link wallet to account ───────────────────────────────── */
export async function linkWallet(token, { address, message, signature }) {
  const res = await fetch(`${API_BASE_URL}/auth/link-wallet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ address, message, signature }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Wallet linking failed");
  const session = getSession();
  if (session) saveSession(data.token || token, { ...session.user, walletAddress: address });
  return data;
}

/* ── Demo / offline fallback ──────────────────────────────── */
export async function registerDemo({ fullName, email, phone }) {
  const fakeToken = btoa(JSON.stringify({ sub: email, exp: Math.floor(Date.now() / 1000) + 43200 }))
    + "." + btoa("{}") + ".demo";
  const user = { id: "demo", email, fullName, phone, walletAddress: null, role: "member" };
  saveSession(fakeToken, user);
  return { token: fakeToken, user };
}
