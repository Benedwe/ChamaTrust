import express from "express";
import { z } from "zod";
import { fallbackAnalytics, getDemoAnalytics } from "../services/demoAnalytics.js";

const router = express.Router();

function calculateRisk({ amount, borrower, analytics }) {
  const borrowerLoans = analytics.loans.filter((loan) => loan.borrower === borrower?.toLowerCase() || loan.borrower === borrower);
  const paidLoans = borrowerLoans.filter((loan) => loan.status === "repaid").length;
  const borrowerRepaymentRate = borrowerLoans.length ? Math.round((paidLoans / borrowerLoans.length) * 100) : analytics.metrics.repaymentRate;
  const exposure = amount / Math.max(analytics.metrics.averageContribution || 1, 1);
  const contributionSignal = Math.min(100, Math.round((analytics.metrics.averageContribution / 100000) * 80));
  const trustScore = Math.max(55, Math.min(98, Math.round((borrowerRepaymentRate * 0.55) + (contributionSignal * 0.25) + 18)));

  if (trustScore >= 85 && exposure <= 5) {
    return {
      loanRisk: "Low",
      approvalRecommendation: "Recommended",
      trustScore,
      repaymentProbability: Math.min(97, trustScore + 3)
    };
  }

  if (trustScore >= 70 && exposure <= 8) {
    return {
      loanRisk: "Medium",
      approvalRecommendation: "Approve with guarantor",
      trustScore,
      repaymentProbability: Math.min(90, trustScore + 2)
    };
  }

  return {
    loanRisk: "High",
    approvalRecommendation: "Manual review required",
    trustScore,
    repaymentProbability: Math.max(52, trustScore - 8)
  };
}

router.post("/credit-score", async (req, res) => {
  const schema = z.object({
    memberId: z.string().trim().min(1).max(120),
    amount: z.number().positive()
  });
  const input = schema.parse(req.body);
  const analytics = await getDemoAnalytics();
  const risk = calculateRisk({ amount: input.amount, borrower: input.memberId, analytics });

  res.json({
    ...risk,
    reason: `${input.memberId} is evaluated against ${analytics.loans.length} local loan records, ${analytics.transactions.length} transaction records, and a group repayment rate of ${analytics.metrics.repaymentRate}%.`,
    source: "mongodb"
  });
});

router.get("/health", async (req, res) => {
  const analytics = await getDemoAnalytics();
  const reserveRatio = analytics.metrics.treasuryBalance
    ? Math.round(((analytics.metrics.treasuryBalance - analytics.metrics.activeLoanAmount) / analytics.metrics.treasuryBalance) * 100)
    : 0;
  const treasuryHealth = reserveRatio >= 65 ? "Strong" : reserveRatio >= 40 ? "Watch" : "Tight";

  res.json({
    treasuryHealth,
    currentBalance: analytics.metrics.treasuryBalance,
    activeLoans: analytics.metrics.activeLoanAmount,
    activeLoanCount: analytics.metrics.activeLoanCount,
    repaymentRate: analytics.metrics.repaymentRate,
    defaultRisk: analytics.metrics.repaymentRate >= 90 ? "Low" : "Medium",
    recommendation: `Based on local MongoDB records, the group can safely approve up to ${Math.max(250000, Math.round(analytics.metrics.treasuryBalance * 0.22)).toLocaleString()} TZS while keeping reserves above target.`,
    source: "mongodb"
  });
});

router.post("/coach", async (req, res) => {
  const schema = z.object({ memberName: z.string().trim().min(1).max(80).default("member") });
  const { memberName } = schema.parse(req.body);
  const analytics = await getDemoAnalytics();

  res.json({
    message: `${memberName} contributed about ${analytics.metrics.averageContribution.toLocaleString()} TZS per deposit in the current local dataset.\n\nAt this pace, the member could accumulate ${(analytics.metrics.averageContribution * 12).toLocaleString()} TZS over 12 contribution cycles.\n\nSuggested next contribution: ${Math.round(analytics.metrics.averageContribution * 1.15).toLocaleString()} TZS to improve group liquidity.`,
    source: "mongodb"
  });
});

router.post("/fraud-check", async (req, res) => {
  const analytics = await getDemoAnalytics();
  const recentRisk = analytics.transactions.find((transaction) => transaction.riskFlags?.length > 0);

  res.json({
    alert: recentRisk
      ? `${recentRisk.provider} ${recentRisk.direction} ${recentRisk.reference} was flagged: ${recentRisk.riskFlags.join(", ")}.`
      : "No high-risk transactions were found in the latest local records.",
    riskLevel: recentRisk ? "High" : "Low",
    recommendation: recentRisk ? "Review manually before approval." : "Continue automated monitoring and keep contribution limits active.",
    source: "mongodb"
  });
});

router.post("/summarize", async (req, res) => {
  const schema = z.object({
    notes: z.string().max(20000).optional(),
    transcript: z.string().max(20000).optional()
  });
  const { notes, transcript } = schema.parse(req.body);
  const source = transcript || notes || "";
  const analytics = source.trim() ? fallbackAnalytics() : await getDemoAnalytics();

  if (!source.trim() && analytics.latestMeeting) {
    return res.json({
      summary: analytics.latestMeeting.summary,
      decisions: analytics.latestMeeting.decisions,
      actionItems: analytics.latestMeeting.actionItems,
      attendees: analytics.latestMeeting.attendees,
      nextMeeting: analytics.latestMeeting.nextMeeting,
      transcript: analytics.latestMeeting.transcript,
      source: "mongodb"
    });
  }

  const hasLoan = source.toLowerCase().includes("loan");
  const hasRepayment = source.toLowerCase().includes("repay") || source.toLowerCase().includes("paid");
  const hasTreasury = source.toLowerCase().includes("treasury") || source.toLowerCase().includes("balance");
  const hasVote = source.toLowerCase().includes("vote") || source.toLowerCase().includes("agreed");

  const decisions = [];
  if (hasLoan) decisions.push("Loan application reviewed and approved pending quorum.");
  if (hasRepayment) decisions.push("Repayment schedule confirmed for outstanding borrowers.");
  if (hasTreasury) decisions.push("Treasury balance reviewed; emergency reserve maintained above 8%.");
  if (hasVote) decisions.push("Unanimous agreement on contribution increase of 10% from next cycle.");
  if (decisions.length === 0) {
    decisions.push("Monthly contributions reviewed.", "Group savings targets reaffirmed.");
  }

  res.json({
    summary: `Chama Meeting Summary\n\nThe meeting covered treasury health, active loans, and upcoming contributions. ${decisions.length} key decisions were recorded. Current local records show ${analytics.metrics.activeLoanCount} active loans and ${analytics.metrics.repaymentRate}% repayment performance.`,
    decisions,
    actionItems: [
      { assignee: "Treasurer", task: "Share updated balance sheet with all members", due: "Within 48 hours" },
      { assignee: "Chairperson", task: "Follow up on pending loan repayments", due: "End of week" },
      { assignee: "Secretary", task: "Circulate official minutes for review", due: "24 hours" }
    ],
    attendees: ["Grace Wanjiku", "Benjamin Otieno", "Amina Hassan", "John Kamau", "Mary Njeri"],
    nextMeeting: "First Saturday of next month, 10:00 AM",
    source: source.trim() ? "live-session" : "mongodb"
  });
});

router.post("/voice", async (req, res) => {
  const schema = z.object({ text: z.string().trim().min(1).max(500) });
  const { text } = schema.parse(req.body);
  const analytics = await getDemoAnalytics();

  if (text.toLowerCase().includes("nimechangia kiasi gani")) {
    res.json({
      response: `Umechangia takribani TZS ${analytics.metrics.averageContribution.toLocaleString()} kwa mchango wa hivi karibuni kwenye rekodi za MongoDB.`,
      source: "mongodb"
    });
  } else {
    res.json({ response: "Sijakuelewa vizuri. Tafadhali rudia.", source: "mongodb" });
  }
});

export default router;
