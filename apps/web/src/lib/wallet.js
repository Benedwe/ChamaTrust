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

/** Last connected EIP-1193 provider (used for signing after connect) */
let activeProvider = null;

function labelProvider(provider) {
  if (provider.isAvalanche || provider.isCore) return "Core Wallet";
  if (provider.isMetaMask) return "MetaMask";
  if (provider.isCoinbaseWallet) return "Coinbase Wallet";
  if (provider.isBraveWallet) return "Brave Wallet";
  if (provider.isRabby) return "Rabby";
  if (provider.isTrust) return "Trust Wallet";
  return "Web3 Wallet";
}

function providerKey(provider) {
  if (provider.isAvalanche || provider.isCore) return "core";
  if (provider.isMetaMask) return "metamask";
  if (provider.isCoinbaseWallet) return "coinbase";
  if (provider.isBraveWallet) return "brave";
  if (provider.isRabby) return "rabby";
  if (provider.isTrust) return "trust";
  return `injected-${provider.providerInfo?.uuid || "default"}`;
}

/**
 * Returns all detected EIP-1193 wallet providers.
 * Supports Core, MetaMask, Coinbase, and any injected Web3 wallet.
 */
export function getAvailableWallets() {
  const seen = new Set();
  const wallets = [];

  const add = (provider) => {
    if (!provider?.request) return;
    const id = providerKey(provider);
    if (seen.has(id)) return;
    seen.add(id);
    wallets.push({ id, name: labelProvider(provider), provider });
  };

  if (window.avalanche) add(window.avalanche);

  const eth = window.ethereum;
  if (!eth) return wallets;

  if (eth.providers?.length) {
    eth.providers.forEach(add);
  } else {
    add(eth);
  }

  return wallets;
}

/** True when any EIP-1193 wallet extension is available */
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

  const signer = await provider.getSigner();
  const message = `Sign in to ChamaTrust on Avalanche at ${new Date().toISOString()}`;
  const signature = await signer.signMessage(message);

  return {
    address,
    chainId: FUJI_CHAIN_ID,
    message,
    signature,
    network: "Avalanche Fuji C-Chain",
    walletName: labelProvider(rawProvider),
  };
}

export async function signApprovalMessage(message) {
  const rawProvider = activeProvider || resolveProvider();
  const provider = new BrowserProvider(rawProvider);
  const signer = await provider.getSigner();
  return signer.signMessage(message);
}

export const CORE_INSTALL_URL = "https://core.app/download";
export const METAMASK_INSTALL_URL = "https://metamask.io/download/";
