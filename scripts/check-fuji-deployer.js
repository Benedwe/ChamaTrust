require("dotenv").config();
const { ethers } = require("ethers");

const FUJI_RPC_URL = process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";

async function main() {
  const privateKey = process.env.PRIVATE_KEY?.trim();
  if (!privateKey) {
    console.error("PRIVATE_KEY is not set. Copy .env.example to .env and add your Fuji deployer key.");
    process.exit(1);
  }

  const normalizedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
  if (!/^0x([0-9a-fA-F]{64})$/.test(normalizedKey)) {
    console.error("PRIVATE_KEY must be a 64-character hex private key.");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(FUJI_RPC_URL);
  const wallet = new ethers.Wallet(normalizedKey, provider);
  const balance = await provider.getBalance(wallet.address);
  const network = await provider.getNetwork();

  console.log("Fuji testnet deployer check");
  console.log("---------------------------");
  console.log("RPC:", FUJI_RPC_URL);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Deployer:", wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "AVAX");

  if (balance === 0n) {
    console.log("\nDeployer has no Fuji AVAX. Fund this address:");
    console.log("  https://faucet.avax.network/");
    console.log("\nThen run: npm run deploy:fuji");
    process.exit(1);
  }

  console.log("\nDeployer is funded and ready for npm run deploy:fuji");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
