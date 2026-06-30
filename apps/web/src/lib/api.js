const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const error = new Error(`API request failed with ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export { API_BASE_URL };
