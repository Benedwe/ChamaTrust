const hre = require("hardhat");

async function main() {
  const privateKey = process.env.PRIVATE_KEY?.trim();
  if (!privateKey) {
    throw new Error("PRIVATE_KEY is not set. Copy .env.example to .env and add a Fuji deployer private key before running npm run deploy:fuji.");
  }

  const normalizedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
  if (!/^0x([0-9a-fA-F]{64})$/.test(normalizedKey)) {
    throw new Error("PRIVATE_KEY must be a 64-character hex private key (with or without an 0x prefix). Update your .env file and try again.");
  }

  const deployer = new hre.ethers.Wallet(normalizedKey, hre.ethers.provider);

  const Stablecoin = await hre.ethers.getContractFactory("MockStablecoin", deployer);
  const stablecoin = await Stablecoin.deploy();
  await stablecoin.waitForDeployment();

  const ChamaTrust = await hre.ethers.getContractFactory("ChamaTrust", deployer);
  const chamaTrust = await ChamaTrust.deploy(deployer.address);
  await chamaTrust.waitForDeployment();

  console.log("Deployer:", deployer.address);
  console.log("MockStablecoin:", await stablecoin.getAddress());
  console.log("ChamaTrust:", await chamaTrust.getAddress());
  console.log("Network:", hre.network.name);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
