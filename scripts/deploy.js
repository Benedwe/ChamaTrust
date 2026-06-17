const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const Stablecoin = await hre.ethers.getContractFactory("MockStablecoin");
  const stablecoin = await Stablecoin.deploy();
  await stablecoin.waitForDeployment();

  const ChamaTrust = await hre.ethers.getContractFactory("ChamaTrust");
  const chamaTrust = await ChamaTrust.deploy(deployer.address);
  await chamaTrust.waitForDeployment();

  console.log("MockStablecoin:", await stablecoin.getAddress());
  console.log("ChamaTrust:", await chamaTrust.getAddress());
  console.log("Network:", hre.network.name);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
