export function calculateTrustScore({ contributionRate = 0, repaymentRate = 0, governanceRate = 0, reliabilityRate = 0 }) {
  const score =
    contributionRate * 0.35 +
    repaymentRate * 0.35 +
    governanceRate * 0.2 +
    reliabilityRate * 0.1;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function analyzeLoanRisk({ trustScore, amount, averageContribution }) {
  const exposure = amount / Math.max(averageContribution, 1);

  if (trustScore >= 85 && exposure <= 4) {
    return { level: "low", recommendation: "Approve if quorum is reached" };
  }

  if (trustScore >= 65 && exposure <= 8) {
    return { level: "medium", recommendation: "Ask for guarantor or shorter repayment term" };
  }

  return { level: "high", recommendation: "Reduce amount or request collateral evidence" };
}
