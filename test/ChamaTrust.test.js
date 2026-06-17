const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChamaTrust", function () {
  async function deployFixture() {
    const [admin, amina, joseph] = await ethers.getSigners();
    const Stablecoin = await ethers.getContractFactory("MockStablecoin");
    const stablecoin = await Stablecoin.deploy();
    const ChamaTrust = await ethers.getContractFactory("ChamaTrust");
    const chamaTrust = await ChamaTrust.deploy(admin.address);

    await stablecoin.mint(amina.address, ethers.parseEther("1000"));
    await stablecoin.mint(joseph.address, ethers.parseEther("1000"));

    return { admin, amina, joseph, stablecoin, chamaTrust };
  }

  it("creates a chama, accepts deposits, votes, and executes loans", async function () {
    const { amina, joseph, stablecoin, chamaTrust } = await deployFixture();
    const tokenAddress = await stablecoin.getAddress();

    await chamaTrust.connect(amina).createChama("Umoja Women SACCO", tokenAddress, 2);
    await chamaTrust.connect(joseph).joinChama(1);

    await stablecoin.connect(amina).approve(await chamaTrust.getAddress(), ethers.parseEther("500"));
    await stablecoin.connect(joseph).approve(await chamaTrust.getAddress(), ethers.parseEther("500"));
    await chamaTrust.connect(amina).depositSavings(1, ethers.parseEther("500"));
    await chamaTrust.connect(joseph).depositSavings(1, ethers.parseEther("500"));

    await chamaTrust.connect(amina).submitLoanRequest(1, ethers.parseEther("100"), "School fees");
    await chamaTrust.connect(amina).voteOnProposal(1, true);
    await chamaTrust.connect(joseph).voteOnProposal(1, true);
    await chamaTrust.executeApprovedProposal(1);

    const proposal = await chamaTrust.proposals(1);
    expect(proposal.status).to.equal(3);
    expect(await stablecoin.balanceOf(amina.address)).to.equal(ethers.parseEther("600"));
  });

  it("calculates reputation from contribution and governance history", async function () {
    const { amina, stablecoin, chamaTrust } = await deployFixture();
    await chamaTrust.connect(amina).createChama("Kijiji Chama", await stablecoin.getAddress(), 1);
    await stablecoin.connect(amina).approve(await chamaTrust.getAddress(), ethers.parseEther("40"));
    await chamaTrust.connect(amina).depositSavings(1, ethers.parseEther("40"));

    const score = await chamaTrust.calculateReputationScore(1, amina.address);
    expect(score).to.equal(35);
  });
});
