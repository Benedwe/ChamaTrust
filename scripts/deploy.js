const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const networkName = hre.network.name;
  let deployer;

  if (networkName === "hardhat" || networkName === "localhost") {
    [deployer] = await hre.ethers.getSigners();
  } else {
    const privateKey = process.env.PRIVATE_KEY?.trim();
    if (!privateKey) {
      throw new Error("PRIVATE_KEY is not set. Copy .env.example to .env and add a Fuji deployer private key before running npm run deploy:fuji.");
    }

    const normalizedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
    if (!/^0x([0-9a-fA-F]{64})$/.test(normalizedKey)) {
      throw new Error("PRIVATE_KEY must be a 64-character hex private key (with or without an 0x prefix). Update your .env file and try again.");
    }

    deployer = new hre.ethers.Wallet(normalizedKey, hre.ethers.provider);
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    if (balance === 0n) {
      throw new Error(
        `Deployer ${deployer.address} has 0 AVAX on ${networkName}. ` +
        "Fund it from https://faucet.avax.network/ then run npm run deploy:fuji again."
      );
    }
  }

  const Stablecoin = await hre.ethers.getContractFactory("MockStablecoin", deployer);
  const stablecoin = await Stablecoin.deploy();
  await stablecoin.waitForDeployment();

  const ChamaTrust = await hre.ethers.getContractFactory("ChamaTrust", deployer);
  const chamaTrust = await ChamaTrust.deploy(deployer.address);
  await chamaTrust.waitForDeployment();

  const stablecoinAddress = await stablecoin.getAddress();
  const chamaTrustAddress = await chamaTrust.getAddress();

  const deployment = {
    network: hre.network.name,
    chainId: 43113,
    deployer: deployer.address,
    MockStablecoin: stablecoinAddress,
    ChamaTrust: chamaTrustAddress,
    deployedAt: new Date().toISOString(),
    rpcUrl: process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
    blockExplorer: "https://testnet.snowtrace.io/",
  };

  const rootDir = path.join(__dirname, "..");
  const deploymentsDir = path.join(rootDir, "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });

  const deploymentPath = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));

  const webPublicDir = path.join(rootDir, "apps/web/public/contracts");
  fs.mkdirSync(webPublicDir, { recursive: true });
  if (hre.network.name === "fuji") {
    fs.writeFileSync(path.join(webPublicDir, "fuji.json"), JSON.stringify(deployment, null, 2));
  }

  console.log("Deployer:", deployer.address);
  console.log("MockStablecoin:", stablecoinAddress);
  console.log("ChamaTrust:", chamaTrustAddress);
  console.log("Network:", hre.network.name);
  console.log("Saved deployment to:", deploymentPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
