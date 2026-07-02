import { BrowserProvider, Wallet, getBytes, isHexString, toUtf8String } from "ethers";

/** Avalanche Fuji C-Chain (testnet) chain ID */
const FUJI_CHAIN_ID = "0xa869"; // 43113 in hex
const FUJI_CHAIN_PARAMS = {
  chainId: FUJI_CHAIN_ID,
  chainName: "Avalanche Fuji C-Chain",
  nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
  rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://testnet.snowtrace.io/"],
};

/** Last connected EIP-1193 provider (used for signing after connect) */
let activeProvider = null;

let mockWalletInstance = null;
function getMockWallet() {
  if (!mockWalletInstance) {
    const savedKey = localStorage.getItem("chamatrust_mock_key");
    if (savedKey) {
      mockWalletInstance = new Wallet(savedKey);
    } else {
      mockWalletInstance = Wallet.createRandom();
      localStorage.setItem("chamatrust_mock_key", mockWalletInstance.privateKey);
    }
  }
  return mockWalletInstance;
}

let mockProviderInstance = null;
export function getMockProvider() {
  if (!mockProviderInstance) {
    mockProviderInstance = {
      isMock: true,
      request: async ({ method, params }) => {
        const mockWallet = getMockWallet();
        if (method === "eth_requestAccounts" || method === "eth_accounts") {
          return [mockWallet.address];
        }
        if (method === "eth_chainId") {
          return FUJI_CHAIN_ID;
        }
        if (method === "wallet_switchEthereumChain") {
          return null;
        }
        if (method === "personal_sign") {
          const message = params[0];
          if (isHexString(message)) {
            try {
              const text = toUtf8String(message);
              return await mockWallet.signMessage(text);
            } catch {
              return await mockWallet.signMessage(getBytes(message));
            }
          }
          return await mockWallet.signMessage(message);
        }
        return null;
      }
    };
  }
  return mockProviderInstance;
}

function labelProvider(provider) {
  if (provider.isMock) return "Demo Wallet (Mock)";
  if (provider.isAvalanche || provider.isCore) return "Core Wallet";
  if (provider.isMetaMask) return "MetaMask";
  if (provider.isCoinbaseWallet) return "Coinbase Wallet";
  if (provider.isBraveWallet) return "Brave Wallet";
  if (provider.isRabby) return "Rabby";
  if (provider.isTrust) return "Trust Wallet";
  return "Web3 Wallet";
}

function providerKey(provider) {
  if (provider.isMock) return "demo-wallet";
  if (provider.isAvalanche || provider.isCore) return "core";
  if (provider.isMetaMask) return "metamask";
  if (provider.isCoinbaseWallet) return "coinbase";
  if (provider.isBraveWallet) return "brave";
  if (provider.isRabby) return "rabby";
  if (provider.isTrust) return "trust";
  return `injected-${provider.providerInfo?.uuid || "default"}`;
}

/**
 * Returns all detected EIP-1193 wallet providers, plus the Demo Wallet.
 */
export function getAvailableWallets() {
  const seen = new Set();
  const wallets = [];

  // Always offer the Demo Wallet
  const mockProv = getMockProvider();
  wallets.push({ id: "demo-wallet", name: "Demo Wallet (Mock)", provider: mockProv });
  seen.add("demo-wallet");

  const add = (provider) => {
    if (!provider?.request) return;
    const id = providerKey(provider);
    if (seen.has(id)) return;
    seen.add(id);
    wallets.push({ id, name: labelProvider(provider), provider });
  };

  if (window.avalanche) add(window.avalanche);

  const eth = window.ethereum;
  if (eth) {
    if (eth.providers?.length) {
      eth.providers.forEach(add);
    } else {
      add(eth);
    }
  }

  return wallets;
}

/** True when any EIP-1193 wallet (or our Mock Wallet) is available */
export function isAnyWalletInstalled() {
  return getAvailableWallets().length > 0;
}

/** @deprecated Use isAnyWalletInstalled — kept for backward compatibility */
export function isCoreInstalled() {
  return isAnyWalletInstalled();
}

function resolveProvider(walletId) {
  const wallets = getAvailableWallets();
  if (walletId) {
    const match = wallets.find((w) => w.id === walletId);
    if (match) return match.provider;
  }
  if (wallets.length === 1) return wallets[0].provider;
  if (wallets.length > 1) throw new Error("MULTIPLE_WALLETS");
  throw new Error("NO_WALLET_INSTALLED");
}

/**
 * Connects to a Web3 wallet and ensures the user is on Fuji C-Chain.
 * @param {string} [walletId] — optional wallet id from getAvailableWallets()
 * @returns {{ address, chainId, message, signature, network, walletName }}
 */
export async function connectWallet(walletId) {
  const rawProvider = resolveProvider(walletId);
  activeProvider = rawProvider;

  const provider = new BrowserProvider(rawProvider);
  const accounts = await provider.send("eth_requestAccounts", []);
  if (!accounts?.length) throw new Error("No accounts returned from wallet.");

  const address = accounts[0];
  
  if (!rawProvider.isMock) {
    const network = await provider.getNetwork();
    const chainId = "0x" + network.chainId.toString(16);

    if (chainId.toLowerCase() !== FUJI_CHAIN_ID.toLowerCase()) {
      try {
        await rawProvider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: FUJI_CHAIN_ID }],
        });
      } catch (switchErr) {
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
  }

  const signer = await provider.getSigner();
  const message = `Sign in to ChamaTrust on Avalanche at ${new Date().toISOString()}`;
  const signature = await signer.signMessage(message);

  if (walletId) {
    localStorage.setItem("chamatrust_connected_wallet_id", walletId);
  }

  return {
    address,
    chainId: FUJI_CHAIN_ID,
    message,
    signature,
    network: "Avalanche Fuji C-Chain",
    walletName: labelProvider(rawProvider),
  };
}

/**
 * Try to reconnect the previously connected wallet non-intrusively.
 */
export async function reconnectWallet() {
  const savedWalletId = localStorage.getItem("chamatrust_connected_wallet_id");
  if (!savedWalletId) return null;

  try {
    const wallets = getAvailableWallets();
    const match = wallets.find((w) => w.id === savedWalletId);
    if (!match) return null;

    const rawProvider = match.provider;
    activeProvider = rawProvider;

    const provider = new BrowserProvider(rawProvider);
    const accounts = await provider.send("eth_accounts", []);
    if (!accounts?.length) return null;

    const address = accounts[0];

    if (!rawProvider.isMock) {
      const network = await provider.getNetwork();
      const chainId = "0x" + network.chainId.toString(16);
      if (chainId.toLowerCase() !== FUJI_CHAIN_ID.toLowerCase()) {
        return null;
      }
    }

    return {
      address,
      chainId: FUJI_CHAIN_ID,
      network: "Avalanche Fuji C-Chain",
      walletName: labelProvider(rawProvider),
    };
  } catch (err) {
    console.warn("Wallet reconnection failed:", err);
    return null;
  }
}

export function disconnectWallet() {
  activeProvider = null;
  localStorage.removeItem("chamatrust_connected_wallet_id");
}

export async function signApprovalMessage(message) {
  const rawProvider = activeProvider || resolveProvider();
  const provider = new BrowserProvider(rawProvider);
  const signer = await provider.getSigner();
  return signer.signMessage(message);
}

export const CORE_INSTALL_URL = "https://core.app/download";
export const METAMASK_INSTALL_URL = "https://metamask.io/download/";
