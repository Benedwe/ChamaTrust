import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    voter: { type: String, required: true, lowercase: true },
    support: { type: Boolean, required: true },
    reason: String,
    txHash: String,
    votedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const loanSchema = new mongoose.Schema(
  {
    chamaId: { type: mongoose.Schema.Types.ObjectId, ref: "Chama", required: true },
    borrower: { type: String, required: true, lowercase: true },
    amount: { type: Number, required: true },
    purpose: { type: String, required: true },
    riskLevel: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    proposalId: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected", "disbursed", "repaid", "defaulted"], default: "pending" },
    votes: [voteSchema],
    dueDate: Date,
    txHash: String
  },
  { timestamps: true }
);

export const Loan = mongoose.model("Loan", loanSchema);
