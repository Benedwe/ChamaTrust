export const group = {
  name: "Umoja Women SACCO",
  location: "Dar es Salaam",
  balance: 42850000,
  currency: "TZS",
  stableBalance: 17140,
  monthlyGrowth: 24,
  healthScore: 92,
  contributionTarget: 5000000,
  activeMembers: 28,
  pendingVotes: 3,
  repaymentRate: 96
};

export const savingsGrowth = [
  { month: "Jan", savings: 18500000, loans: 5400000 },
  { month: "Feb", savings: 21400000, loans: 6200000 },
  { month: "Mar", savings: 26700000, loans: 7100000 },
  { month: "Apr", savings: 30200000, loans: 6800000 },
  { month: "May", savings: 37100000, loans: 8300000 },
  { month: "Jun", savings: 42850000, loans: 9100000 }
];

export const treasuryMix = [
  { name: "Member Savings", value: 61 },
  { name: "Loan Float", value: 24 },
  { name: "Emergency Fund", value: 10 },
  { name: "Rewards", value: 5 }
];

export const contributors = [
  { name: "Amina", amount: 1850000, score: 98, badge: "Top Saver" },
  { name: "Neema", amount: 1510000, score: 94, badge: "Trusted Member" },
  { name: "Joseph", amount: 1320000, score: 91, badge: "Governance Champion" },
  { name: "Fatma", amount: 1160000, score: 89, badge: "Early Contributor" }
];

export const proposals = [
  {
    id: "LN-2048",
    member: "Amina",
    purpose: "School fees",
    amount: 100000,
    approved: 4,
    rejected: 1,
    needed: 3,
    risk: "Low",
    status: "Ready to execute"
  },
  {
    id: "LN-2049",
    member: "Joseph",
    purpose: "Maize inventory",
    amount: 450000,
    approved: 2,
    rejected: 0,
    needed: 3,
    risk: "Medium",
    status: "Voting"
  }
];

export const transactions = [
  { id: "0xa7...91e", rail: "M-Pesa", type: "Deposit", amount: 250000, status: "Confirmed", time: "2 min ago" },
  { id: "0xe1...44b", rail: "Avalanche", type: "Loan executed", amount: 100000, status: "Finalized", time: "18 min ago" },
  { id: "0x9c...02d", rail: "Airtel Money", type: "Repayment", amount: 75000, status: "Confirmed", time: "1 hr ago" }
];

export const heatmap = Array.from({ length: 35 }, (_, index) => ({
  day: index + 1,
  level: [1, 3, 2, 4, 2, 5, 1][index % 7]
}));

export const momoProviders = ["M-Pesa", "Airtel Money", "Tigo Pesa", "HaloPesa", "Pesapal"];

export const agriLoans = [
  { id: "AGL-1", type: "Seed & Fertilizer", farmer: "Amina", amount: 500000, duration: "6 Months", status: "Active", progress: 60, nextPayment: "12th Jul" },
  { id: "AGL-2", type: "Tractor Lease", farmer: "Joseph", amount: 1200000, duration: "12 Months", status: "Pending Approval", progress: 0, nextPayment: "-" },
  { id: "AGL-3", type: "Irrigation Kit", farmer: "Neema", amount: 350000, duration: "3 Months", status: "Completed", progress: 100, nextPayment: "-" }
];

export const investmentPools = [
  { id: "POOL-1", name: "Maize Farm Yield Pool", apy: 12.5, tvl: 4500000, capacity: 5000000, risk: "Low", category: "Agriculture" },
  { id: "POOL-2", name: "Dairy Co-op Fund", apy: 10.2, tvl: 2100000, capacity: 10000000, risk: "Medium", category: "Livestock" },
  { id: "POOL-3", name: "Solar Panel Aggregation", apy: 14.0, tvl: 850000, capacity: 2000000, risk: "High", category: "Green Energy" }
];
