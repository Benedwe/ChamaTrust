require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const FUJI_RPC_URL = process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const FUJI_ACCOUNTS = /^0x[0-9a-fA-F]{64}$/.test(PRIVATE_KEY) ? [PRIVATE_KEY] : [];

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    fuji: {
      url: FUJI_RPC_URL,
      chainId: 43113,
      accounts: FUJI_ACCOUNTS
    }
  }
};
