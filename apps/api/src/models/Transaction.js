import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    chamaId: { type: mongoose.Schema.Types.ObjectId, ref: "Chama" },
    member: { type: String, lowercase: true },
    provider: { type: String, enum: ["M-Pesa", "Airtel Money", "Tigo Pesa", "HaloPesa", "Avalanche"], required: true },
    direction: { type: String, enum: ["deposit", "withdrawal", "repayment", "loan"], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "TZS" },
    phone: String,
    reference: { type: String, required: true, unique: true },
    txHash: String,
    status: { type: String, enum: ["initiated", "prompted", "confirmed", "failed", "settled"], default: "initiated" },
    riskFlags: [{ type: String }],
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
