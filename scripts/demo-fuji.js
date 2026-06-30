const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting ChamaTrust Avalanche Fuji Demo...\n");

  const [deployer] = await hre.ethers.getSigners();
  const address = deployer.address;
  console.log(`👤 Using Account: ${address}`);
  
  const balance = await hre.ethers.provider.getBalance(address);
  console.log(`💰 AVAX Balance: ${hre.ethers.formatEther(balance)} AVAX\n`);

  if (balance === 0n) {
    console.error("❌ ERROR: Your account has 0 AVAX.");
    console.error("Please get some testnet AVAX from https://core.app/tools/testnet-faucet/");
    process.exit(1);
  }

  // 1. Deploy MockStablecoin
  console.log("⏳ Deploying MockStablecoin (cTZS)...");
  const Stablecoin = await hre.ethers.getContractFactory("MockStablecoin");
  const stablecoin = await Stablecoin.deploy();
  await stablecoin.waitForDeployment();
  const tokenAddress = await stablecoin.getAddress();
  console.log(`✅ MockStablecoin deployed to: ${tokenAddress}\n`);

  // 2. Deploy ChamaTrust
  console.log("⏳ Deploying ChamaTrust...");
  const ChamaTrust = await hre.ethers.getContractFactory("ChamaTrust");
  const chamaTrust = await ChamaTrust.deploy(address);
  await chamaTrust.waitForDeployment();
  const chamaTrustAddress = await chamaTrust.getAddress();
  console.log(`✅ ChamaTrust deployed to: ${chamaTrustAddress}\n`);

  // 3. Create a Chama
  console.log("⏳ Creating a new Chama on-chain...");
  // Set quorum to 1 for the demo so we don't need multiple accounts to vote
  const createTx = await chamaTrust.createChama("Demo Avalanche Chama", tokenAddress, 1);
  await createTx.wait();
  console.log(`✅ Chama Created! Transaction Hash: ${createTx.hash}\n`);
  
  const chamaId = 1; // It's the first one

  // 4. Approve and Deposit
  const depositAmount = hre.ethers.parseEther("50000"); // 50,000 cTZS
  console.log(`⏳ Approving ${hre.ethers.formatEther(depositAmount)} cTZS for ChamaTrust...`);
  const approveTx = await stablecoin.approve(chamaTrustAddress, depositAmount);
  await approveTx.wait();
  
  console.log("⏳ Depositing savings into Chama treasury...");
  const depositTx = await chamaTrust.depositSavings(chamaId, depositAmount);
  await depositTx.wait();
  console.log(`✅ Deposit Successful! Transaction Hash: ${depositTx.hash}\n`);

  // 5. Submit Loan Request
  const loanAmount = hre.ethers.parseEther("15000"); // 15,000 cTZS
  console.log(`⏳ Submitting loan request for ${hre.ethers.formatEther(loanAmount)} cTZS...`);
  const loanTx = await chamaTrust.submitLoanRequest(chamaId, loanAmount, "Demo Business Expansion");
  await loanTx.wait();
  console.log(`✅ Loan Requested! Transaction Hash: ${loanTx.hash}\n`);
  
  const proposalId = 1;

  // 6. Vote on Loan
  console.log("⏳ Voting to approve the loan...");
  // Quorum is 1, so 1 vote approves it
  const voteTx = await chamaTrust.voteOnProposal(proposalId, true);
  await voteTx.wait();
  console.log(`✅ Vote Cast (Approved)! Transaction Hash: ${voteTx.hash}\n`);

  // 7. Execute Loan
  console.log("⏳ Executing the approved loan (transferring funds to borrower)...");
  const executeTx = await chamaTrust.executeApprovedProposal(proposalId);
  await executeTx.wait();
  console.log(`✅ Loan Executed! Transaction Hash: ${executeTx.hash}\n`);

  console.log("🎉 Demo completed successfully!");
  console.log("🔗 You can view these transactions on the Snowtrace Testnet Explorer:");
  console.log(`   https://testnet.snowtrace.io/address/${chamaTrustAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
