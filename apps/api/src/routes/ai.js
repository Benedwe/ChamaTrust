import express from "express";

const router = express.Router();

router.post("/credit-score", (req, res) => {
  // Mock logic to simulate AI analyzing member data
  const { memberId, amount } = req.body;
  res.json({
    loanRisk: "Low",
    approvalRecommendation: "Recommended",
    trustScore: 91,
    repaymentProbability: 94,
    reason: "Member has contributed consistently for 8 months and repaid previous loans on time."
  });
});

router.get("/health", (req, res) => {
  res.json({
    treasuryHealth: "Strong",
    currentBalance: 3200000,
    activeLoans: 1100000,
    defaultRisk: "Low",
    recommendation: "The group can safely approve up to 1,000,000 TZS in new loans."
  });
});

router.post("/coach", (req, res) => {
  const { memberName } = req.body;
  res.json({
    message: `You contributed 50,000 TZS this month.\n\nAt your current rate, you could accumulate 600,000 TZS within 12 months.\n\nSuggested contribution: 65,000 TZS monthly.`
  });
});

router.post("/fraud-check", (req, res) => {
  res.json({
    alert: "Member has submitted 4 loan requests within 14 days.",
    riskLevel: "High",
    recommendation: "Review manually before approval."
  });
});

router.post("/summarize", (req, res) => {
  const { notes, transcript } = req.body;
  const source = transcript || notes || "";

  // Simulate AI parsing key content from transcript/notes
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
    summary: `Chama Meeting Summary\n\nThe meeting covered treasury health, active loans, and upcoming contributions. ${decisions.length} key decisions were recorded. All members participated constructively.`,
    decisions,
    actionItems: [
      { assignee: "Treasurer", task: "Share updated balance sheet with all members", due: "Within 48 hours" },
      { assignee: "Chairperson", task: "Follow up on pending loan repayments", due: "End of week" },
      { assignee: "Secretary", task: "Circulate official minutes for review", due: "24 hours" }
    ],
    attendees: ["Grace Wanjiku", "Benjamin Otieno", "Amina Hassan", "John Kamau", "Mary Njeri"],
    nextMeeting: "First Saturday of next month, 10:00 AM"
  });
});

router.post("/voice", (req, res) => {
  const { text } = req.body;
  if (text.toLowerCase().includes("nimechangia kiasi gani")) {
    res.json({ response: "Umechangia TZS 80,000 mwezi huu." });
  } else {
    res.json({ response: "Sijakuelewa vizuri. Tafadhali rudia." }); // "I didn't understand. Please repeat."
  }
});

export default router;
