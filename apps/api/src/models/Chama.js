import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    walletAddress: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ["admin", "member", "auditor"], default: "member" },
    trustScore: { type: Number, default: 50 },
    joinedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const chamaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    country: { type: String, default: "TZ" },
    currency: { type: String, default: "TZS" },
    phone: { type: String, default: "" },
    treasuryAddress: { type: String, required: true },
    contractAddress: { type: String },
    quorum: { type: Number, default: 3 },
    minimumContribution: { type: Number, default: 10000 },
    members: [memberSchema],
    status: { type: String, enum: ["active", "paused"], default: "active" }
  },
  { timestamps: true }
);

export const Chama = mongoose.model("Chama", chamaSchema);
