import { Chama } from "../models/Chama.js";
import { Loan } from "../models/Loan.js";
import { Meeting } from "../models/Meeting.js";
import { Transaction } from "../models/Transaction.js";

export async function getDemoAnalytics() {
  try {
    const mongoose = await import("mongoose");
    if (!mongoose.default.connection || mongoose.default.connection.readyState !== 1) {
      return fallbackAnalytics();
    }

    const [chama, loans, transactions, latestMeeting] = await Promise.all([
      Chama.findOne().sort({ createdAt: -1 }).lean(),
      Loan.find().sort({ createdAt: -1 }).limit(25).lean(),
      Transaction.find().sort({ createdAt: -1 }).limit(100).lean(),
      Meeting.findOne().sort({ scheduledFor: -1 }).lean()
    ]);

  const deposits = transactions.filter((transaction) => transaction.direction === "deposit");
  const repayments = transactions.filter((transaction) => transaction.direction === "repayment");
  const confirmedDeposits = deposits.filter((transaction) => ["confirmed", "settled"].includes(transaction.status));
  const treasuryBalance = confirmedDeposits.reduce((total, transaction) => total + transaction.amount, 0);
  const activeLoans = loans.filter((loan) => ["pending", "approved", "disbursed"].includes(loan.status));
  const repaidLoans = loans.filter((loan) => loan.status === "repaid").length;
  const repaymentRate = loans.length ? Math.round((repaidLoans / loans.length) * 100) : 0;
  const highRiskTransactions = transactions.filter((transaction) => transaction.riskFlags?.length > 0);
  const pendingVotes = loans.reduce((total, loan) => total + Math.max(0, (chama?.quorum || 3) - (loan.votes?.length || 0)), 0);
  const averageContribution = deposits.length
    ? Math.round(deposits.reduce((total, transaction) => total + transaction.amount, 0) / deposits.length)
    : 0;

  return {
    chama,
    loans,
    transactions,
    latestMeeting,
    metrics: {
      treasuryBalance,
      activeLoanAmount: activeLoans.reduce((total, loan) => total + loan.amount, 0),
      activeLoanCount: activeLoans.length,
      repaymentRate,
      pendingVotes,
      memberCount: chama?.members?.length || 0,
      averageContribution,
      repaymentVolume: repayments.reduce((total, transaction) => total + transaction.amount, 0),
      highRiskTransactionCount: highRiskTransactions.length
    }
  };
  } catch (err) {
    console.warn("DB query failed in getDemoAnalytics, using fallback mock data:", err.message);
    return fallbackAnalytics();
  }
}

export function fallbackAnalytics() {
  return {
    chama: null,
    loans: [],
    transactions: [],
    latestMeeting: null,
    metrics: {
      treasuryBalance: 3200000,
      activeLoanAmount: 1100000,
      activeLoanCount: 3,
      repaymentRate: 96,
      pendingVotes: 3,
      memberCount: 28,
      averageContribution: 80000,
      repaymentVolume: 650000,
      highRiskTransactionCount: 1
    }
  };
}
