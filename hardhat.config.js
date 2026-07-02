require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const FUJI_RPC_URL = process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";
const PRIVATE_KEY = process.env.PRIVATE_KEY?.trim() || "";
const normalizedKey = PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : PRIVATE_KEY ? `0x${PRIVATE_KEY}` : "";
const FUJI_ACCOUNTS = /^0x[0-9a-fA-F]{64}$/.test(normalizedKey) ? [normalizedKey] : [];

if (process.env.NODE_ENV !== "test" && !FUJI_ACCOUNTS.length && PRIVATE_KEY) {
  console.warn(
    "Warning: PRIVATE_KEY is set but invalid. Fuji testnet deployment requires a 64-character hex private key."
  );
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    fuji: {
      url: FUJI_RPC_URL,
      chainId: 43113,
      accounts: FUJI_ACCOUNTS,
    },
  },
  etherscan: {
    apiKey: {
      avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY || "snowtrace",
    },
  },
  sourcify: {
    enabled: false,
  },
};
