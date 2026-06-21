import { BrowserProvider } from "ethers";

/** Avalanche Fuji C-Chain (testnet) chain ID */
const FUJI_CHAIN_ID = "0xa869"; // 43113 in hex
const FUJI_CHAIN_PARAMS = {
  chainId: FUJI_CHAIN_ID,
  chainName: "Avalanche Fuji C-Chain",
  nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
  rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://testnet.snowtrace.io/"],
};

/**
 * Detects if the Avalanche Core wallet extension is installed.
 * Core injects window.avalanche and/or sets isAvalanche / isCore on window.ethereum.
 */
export function isCoreInstalled() {
  const eth = window.ethereum;
  if (!eth) return false;
  // Core sets window.avalanche AND flags on the ethereum provider
  return !!(
    window.avalanche ||
    eth.isAvalanche ||
    eth.isCore ||
    // Some versions of Core identify via multiple providers
    eth.providers?.some((p) => p.isAvalanche || p.isCore)
  );
}

/**
 * Returns the best provider to use:
 * - Prefers Core wallet (window.avalanche or the Core provider in ethereum.providers)
 * - Falls back to window.ethereum if Core flags are present
 * - Throws if neither Core nor a compatible wallet is found
 */
function getCoreProvider() {
  // If Core injects a dedicated window.avalanche provider, use it
  if (window.avalanche) return window.avalanche;

  const eth = window.ethereum;
  if (!eth) throw new Error("CORE_NOT_INSTALLED");

  // Multiple wallets: pick Core's provider from the list
  if (eth.providers?.length) {
    const core = eth.providers.find((p) => p.isAvalanche || p.isCore);
    if (core) return core;
  }

  // Single provider — check if it's Core
  if (eth.isAvalanche || eth.isCore) return eth;

  throw new Error("CORE_NOT_INSTALLED");
}

/**
 * Connects to Avalanche Core wallet and ensures the user is on Fuji C-Chain.
 * Returns { address, chainId, message, signature }.
 */
export async function connectWallet() {
  const rawProvider = getCoreProvider();

  const provider = new BrowserProvider(rawProvider);

  // Request accounts (triggers Core wallet popup)
  const accounts = await provider.send("eth_requestAccounts", []);
  if (!accounts?.length) throw new Error("No accounts returned from Core wallet.");

  const address = accounts[0];

  // Ensure user is on Avalanche Fuji C-Chain
  const network = await provider.getNetwork();
  const chainId = "0x" + network.chainId.toString(16);

  if (chainId.toLowerCase() !== FUJI_CHAIN_ID.toLowerCase()) {
    try {
      // Ask Core to switch to Fuji
      await rawProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: FUJI_CHAIN_ID }],
      });
    } catch (switchErr) {
      // Chain not added to Core yet — add it
      if (switchErr.code === 4902 || switchErr.code === -32603) {
        await rawProvider.request({
          method: "wallet_addEthereumChain",
          params: [FUJI_CHAIN_PARAMS],
        });
      } else {
        throw switchErr;
      }
    }
  }

  // Sign a message so the app can verify ownership (optional but best-practice)
  const signer = await provider.getSigner();
  const message = `Sign in to ChamaTrust on Avalanche at ${new Date().toISOString()}`;
  const signature = await signer.signMessage(message);

  return {
    address,
    chainId: FUJI_CHAIN_ID,
    message,
    signature,
    network: "Avalanche Fuji C-Chain",
  };
}

/** Deep-link / redirect to Core wallet install page */
export const CORE_INSTALL_URL = "https://core.app/download";
