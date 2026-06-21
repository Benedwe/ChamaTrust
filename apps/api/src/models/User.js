import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName:      { type: String, required: true, trim: true },
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:         { type: String, required: true, trim: true },
    passwordHash:  { type: String, required: true },
    walletAddress: { type: String, lowercase: true, default: null },
    role:          { type: String, enum: ["member", "admin", "auditor"], default: "member" },
    isVerified:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
