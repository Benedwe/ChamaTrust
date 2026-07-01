import { API_BASE_URL } from "./config.js";
import { getSession } from "./auth.js";

export async function apiFetch(path, options = {}) {
  const session = getSession();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (session?.token && !headers.Authorization) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = new Error(data?.error || `API request failed with ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/** Ping the backend health endpoint — returns true when the API is reachable */
export async function checkApiHealth() {
  try {
    const data = await apiFetch("/health");
    return data?.status === "ok";
  } catch {
    return false;
  }
}

export { API_BASE_URL };
