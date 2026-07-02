/** Shared frontend configuration — single source of truth for API URL */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? "/api" : "http://localhost:8080");

/** Avalanche Fuji C-Chain */
export const FUJI_CHAIN_ID = 43113;
