/**
 * ChamaTrust — MongoDB Demo Seed Script
 * ──────────────────────────────────────
 * Populates the `chamatrustdb` database at localhost:27017 with realistic
 * demo data so the platform is ready for a live demo.
 *
 * Usage:
 *   node scripts/seed-db.js            # seed (skip if data exists)
 *   node scripts/seed-db.js --force     # drop & reseed
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

/* ── Config ──────────────────────────────────────────────────── */
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/chamatrustdb";
const FORCE = process.argv.includes("--force");

/* ── Inline schemas (mirrors apps/api/src/models) ───────────── */
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

const memberSubSchema = new mongoose.Schema(
  {
    walletAddress: { type: String, required: true, lowercase: true },
    phone:         { type: String, required: true },
    role:          { type: String, enum: ["admin", "member", "auditor"], default: "member" },
    trustScore:    { type: Number, default: 50 },
    joinedAt:      { type: Date, default: Date.now },
  },
  { _id: false }
);

const chamaSchema = new mongoose.Schema(
  {
    name:                 { type: String, required: true },
    country:              { type: String, default: "TZ" },
    currency:             { type: String, default: "TZS" },
    treasuryAddress:      { type: String, required: true },
    contractAddress:      { type: String },
    quorum:               { type: Number, default: 3 },
    minimumContribution:  { type: Number, default: 10000 },
    members:              [memberSubSchema],
    status:               { type: String, enum: ["active", "paused"], default: "active" },
  },
  { timestamps: true }
);

const transactionSchema = new mongoose.Schema(
  {
    chamaId:   { type: mongoose.Schema.Types.ObjectId, ref: "Chama" },
    member:    { type: String, lowercase: true },
    provider:  { type: String, enum: ["M-Pesa", "Airtel Money", "Tigo Pesa", "HaloPesa", "Avalanche"], required: true },
    direction: { type: String, enum: ["deposit", "withdrawal", "repayment", "loan"], required: true },
    amount:    { type: Number, required: true },
    currency:  { type: String, default: "TZS" },
    phone:     String,
    reference: { type: String, required: true, unique: true },
    txHash:    String,
    status:    { type: String, enum: ["initiated", "prompted", "confirmed", "failed", "settled"], default: "initiated" },
    riskFlags: [{ type: String }],
    metadata:  mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const voteSubSchema = new mongoose.Schema(
  {
    voter:   { type: String, required: true, lowercase: true },
    support: { type: Boolean, required: true },
    reason:  String,
    txHash:  String,
    votedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const loanSchema = new mongoose.Schema(
  {
    chamaId:    { type: mongoose.Schema.Types.ObjectId, ref: "Chama", required: true },
    borrower:   { type: String, required: true, lowercase: true },
    amount:     { type: Number, required: true },
    purpose:    { type: String, required: true },
    riskLevel:  { type: String, enum: ["low", "medium", "high"], default: "medium" },
    proposalId: { type: String, required: true },
    status:     { type: String, enum: ["pending", "approved", "rejected", "disbursed", "repaid", "defaulted"], default: "pending" },
    votes:      [voteSubSchema],
    dueDate:    Date,
    txHash:     String,
  },
  { timestamps: true }
);

const transcriptLineSchema = new mongoose.Schema(
  {
    speaker:  { type: String, required: true, trim: true },
    text:     { type: String, required: true, trim: true },
    spokenAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const actionItemSchema = new mongoose.Schema(
  {
    assignee: { type: String, required: true, trim: true },
    task:     { type: String, required: true, trim: true },
    due:      { type: String, required: true, trim: true },
    status:   { type: String, enum: ["open", "done"], default: "open" },
  },
  { _id: false }
);

const meetingSchema = new mongoose.Schema(
  {
    chamaId:         { type: mongoose.Schema.Types.ObjectId, ref: "Chama" },
    title:           { type: String, required: true, trim: true },
    scheduledFor:    { type: Date, required: true },
    durationMinutes: { type: Number, min: 0, default: 0 },
    status:          { type: String, enum: ["scheduled", "live", "completed"], default: "completed" },
    attendees:       [{ type: String, trim: true }],
    transcript:      [transcriptLineSchema],
    summary:         { type: String, required: true, trim: true },
    decisions:       [{ type: String, trim: true }],
    actionItems:     [actionItemSchema],
    nextMeeting:     { type: String, trim: true },
    aiConfidence:    { type: Number, min: 0, max: 100, default: 92 },
  },
  { timestamps: true }
);

const User        = mongoose.model("User", userSchema);
const Chama       = mongoose.model("Chama", chamaSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);
const Loan        = mongoose.model("Loan", loanSchema);
const Meeting     = mongoose.model("Meeting", meetingSchema);

/* ── Utility ─────────────────────────────────────────────────── */
const fakeWallet = () =>
  "0x" + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
const daysAgo = (n) => new Date(Date.now() - n * 86400000);

/* ── Seed Logic ──────────────────────────────────────────────── */
async function seed() {
  console.log("🔗 Connecting to MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to chamatrustdb\n");

  if (FORCE) {
    console.log("🗑️  --force flag detected — dropping existing data...");
    await Promise.all([
      User.deleteMany({}),
      Chama.deleteMany({}),
      Transaction.deleteMany({}),
      Loan.deleteMany({}),
      Meeting.deleteMany({}),
    ]);
    console.log("   Dropped all collections.\n");
  } else {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`⚡ Database already has ${userCount} user(s). Skipping seed.`);
      console.log("   Use --force to drop and reseed.\n");
      await mongoose.disconnect();
      return;
    }
  }

  /* ── 1. Users ──────────────────────────────────────────────── */
  console.log("👤 Seeding users...");
  const passwordHash = await bcrypt.hash("Demo@1234", 12);

  const wallets = Array.from({ length: 6 }, fakeWallet);

  const users = await User.insertMany([
    {
      fullName: "Amina Mwangi",
      email: "amina@chamatrust.demo",
      phone: "+255712345678",
      passwordHash,
      walletAddress: wallets[0],
      role: "admin",
      isVerified: true,
    },
    {
      fullName: "Joseph Ochieng",
      email: "joseph@chamatrust.demo",
      phone: "+255723456789",
      passwordHash,
      walletAddress: wallets[1],
      role: "member",
      isVerified: true,
    },
    {
      fullName: "Grace Njeri",
      email: "grace@chamatrust.demo",
      phone: "+255734567890",
      passwordHash,
      walletAddress: wallets[2],
      role: "member",
      isVerified: true,
    },
    {
      fullName: "David Kamau",
      email: "david@chamatrust.demo",
      phone: "+255745678901",
      passwordHash,
      walletAddress: wallets[3],
      role: "auditor",
      isVerified: true,
    },
    {
      fullName: "Fatuma Hassan",
      email: "fatuma@chamatrust.demo",
      phone: "+255756789012",
      passwordHash,
      walletAddress: wallets[4],
      role: "member",
      isVerified: true,
    },
    {
      fullName: "Peter Kibet",
      email: "peter@chamatrust.demo",
      phone: "+255767890123",
      passwordHash,
      walletAddress: wallets[5],
      role: "member",
      isVerified: false,
    },
  ]);
  console.log(`   ✅ ${users.length} demo users created`);

  /* ── 2. Chamas ─────────────────────────────────────────────── */
  console.log("🏠 Seeding chamas...");
  const treasuryWallet1 = fakeWallet();
  const treasuryWallet2 = fakeWallet();

  const chamas = await Chama.insertMany([
    {
      name: "Umoja Savings Circle",
      country: "KE",
      currency: "KES",
      treasuryAddress: treasuryWallet1,
      contractAddress: fakeWallet(),
      quorum: 3,
      minimumContribution: 5000,
      members: [
        { walletAddress: wallets[0], phone: "+255712345678", role: "admin", trustScore: 92 },
        { walletAddress: wallets[1], phone: "+255723456789", role: "member", trustScore: 78 },
        { walletAddress: wallets[2], phone: "+255734567890", role: "member", trustScore: 85 },
        { walletAddress: wallets[3], phone: "+255745678901", role: "auditor", trustScore: 88 },
      ],
      status: "active",
    },
    {
      name: "Jamii Prosperity Fund",
      country: "TZ",
      currency: "TZS",
      treasuryAddress: treasuryWallet2,
      contractAddress: fakeWallet(),
      quorum: 2,
      minimumContribution: 10000,
      members: [
        { walletAddress: wallets[0], phone: "+255712345678", role: "admin", trustScore: 92 },
        { walletAddress: wallets[4], phone: "+255756789012", role: "member", trustScore: 71 },
        { walletAddress: wallets[5], phone: "+255767890123", role: "member", trustScore: 45 },
      ],
      status: "active",
    },
  ]);
  console.log(`   ✅ ${chamas.length} chamas created`);

  /* ── 3. Transactions ───────────────────────────────────────── */
  console.log("💸 Seeding transactions...");
  const txData = [
    // Umoja — deposits & repayments
    { chamaId: chamas[0]._id, member: wallets[0], provider: "M-Pesa",       direction: "deposit",   amount: 5000,  currency: "KES", phone: "+255712345678", status: "confirmed" },
    { chamaId: chamas[0]._id, member: wallets[1], provider: "M-Pesa",       direction: "deposit",   amount: 5000,  currency: "KES", phone: "+255723456789", status: "confirmed" },
    { chamaId: chamas[0]._id, member: wallets[2], provider: "Airtel Money", direction: "deposit",   amount: 7500,  currency: "KES", phone: "+255734567890", status: "confirmed" },
    { chamaId: chamas[0]._id, member: wallets[3], provider: "M-Pesa",       direction: "deposit",   amount: 5000,  currency: "KES", phone: "+255745678901", status: "confirmed" },
    { chamaId: chamas[0]._id, member: wallets[1], provider: "Avalanche",    direction: "repayment", amount: 12000, currency: "KES", phone: "+255723456789", status: "settled" },
    { chamaId: chamas[0]._id, member: wallets[0], provider: "M-Pesa",       direction: "deposit",   amount: 5000,  currency: "KES", phone: "+255712345678", status: "confirmed" },
    // Jamii — deposits
    { chamaId: chamas[1]._id, member: wallets[0], provider: "Tigo Pesa",    direction: "deposit",   amount: 15000, currency: "TZS", phone: "+255712345678", status: "confirmed" },
    { chamaId: chamas[1]._id, member: wallets[4], provider: "HaloPesa",     direction: "deposit",   amount: 10000, currency: "TZS", phone: "+255756789012", status: "confirmed" },
    { chamaId: chamas[1]._id, member: wallets[5], provider: "Tigo Pesa",    direction: "deposit",   amount: 10000, currency: "TZS", phone: "+255767890123", status: "prompted" },
    // A few initiated / failed for realism
    { chamaId: chamas[0]._id, member: wallets[2], provider: "M-Pesa",       direction: "deposit",   amount: 5000,  currency: "KES", phone: "+255734567890", status: "failed",    riskFlags: ["timeout"] },
    { chamaId: chamas[1]._id, member: wallets[4], provider: "Airtel Money", direction: "withdrawal",amount: 5000,  currency: "TZS", phone: "+255756789012", status: "initiated" },
  ];

  const transactions = await Transaction.insertMany(
    txData.map((t) => ({
      ...t,
      reference: `CT-${nanoid(10)}`,
      txHash: t.status === "settled" ? `0x${nanoid(64)}` : undefined,
      createdAt: daysAgo(Math.floor(Math.random() * 30)),
    }))
  );
  console.log(`   ✅ ${transactions.length} transactions created`);

  /* ── 4. Loans ──────────────────────────────────────────────── */
  console.log("🏦 Seeding loans...");
  const loans = await Loan.insertMany([
    {
      chamaId: chamas[0]._id,
      borrower: wallets[1],
      amount: 25000,
      purpose: "Small business — poultry supplies",
      riskLevel: "low",
      proposalId: `PROP-${nanoid(6)}`,
      status: "approved",
      votes: [
        { voter: wallets[0], support: true, reason: "Long-standing member with good track record" },
        { voter: wallets[2], support: true, reason: "Viable business plan" },
        { voter: wallets[3], support: true, reason: "Low risk based on repayment history" },
      ],
      dueDate: new Date(Date.now() + 90 * 86400000),
      txHash: `0x${nanoid(64)}`,
    },
    {
      chamaId: chamas[0]._id,
      borrower: wallets[2],
      amount: 15000,
      purpose: "School fees — Term 2",
      riskLevel: "medium",
      proposalId: `PROP-${nanoid(6)}`,
      status: "pending",
      votes: [
        { voter: wallets[0], support: true, reason: "Essential expense" },
        { voter: wallets[1], support: false, reason: "Existing loan outstanding" },
      ],
      dueDate: new Date(Date.now() + 60 * 86400000),
    },
    {
      chamaId: chamas[1]._id,
      borrower: wallets[4],
      amount: 50000,
      purpose: "Market stall expansion",
      riskLevel: "medium",
      proposalId: `PROP-${nanoid(6)}`,
      status: "disbursed",
      votes: [
        { voter: wallets[0], support: true, reason: "Good business proposition" },
        { voter: wallets[5], support: true, reason: "Will increase chama revenue" },
      ],
      dueDate: new Date(Date.now() + 120 * 86400000),
      txHash: `0x${nanoid(64)}`,
    },
  ]);
  console.log(`   ✅ ${loans.length} loans created`);

  /* ── 5. Meetings ───────────────────────────────────────────── */
  console.log("📋 Seeding meetings...");
  const meetings = await Meeting.insertMany([
    {
      chamaId: chamas[0]._id,
      title: "Umoja Monthly Review — June 2026",
      scheduledFor: daysAgo(3),
      durationMinutes: 47,
      status: "completed",
      attendees: ["Amina Mwangi", "Joseph Ochieng", "Grace Njeri", "David Kamau"],
      transcript: [
        { speaker: "Amina Mwangi",    text: "Welcome everyone. Let's start with the treasury update.",    spokenAt: daysAgo(3) },
        { speaker: "David Kamau",     text: "Treasury balance stands at KES 32,500. All contributions this month are accounted for.", spokenAt: daysAgo(3) },
        { speaker: "Joseph Ochieng", text: "I'd like to request a loan of KES 25,000 for poultry supplies.", spokenAt: daysAgo(3) },
        { speaker: "Grace Njeri",     text: "I support Joseph's request. He has always repaid on time.",    spokenAt: daysAgo(3) },
        { speaker: "Amina Mwangi",    text: "Motion approved with 3 votes in favour. Joseph, please submit the on-chain proposal.", spokenAt: daysAgo(3) },
      ],
      summary: "Monthly review: treasury balance KES 32,500. Joseph's KES 25,000 loan for poultry supplies approved (3–0). Grace proposed increasing minimum contribution to KES 7,500 — deferred to next meeting. David confirmed all audit records are up to date.",
      decisions: [
        "Approve Joseph's KES 25,000 loan for poultry supplies",
        "Defer minimum contribution increase discussion",
        "Schedule next meeting for July 15",
      ],
      actionItems: [
        { assignee: "Joseph Ochieng", task: "Submit on-chain loan proposal", due: "2026-07-02", status: "done" },
        { assignee: "David Kamau",    task: "Publish audit summary to members",  due: "2026-07-05", status: "open" },
        { assignee: "Amina Mwangi",   task: "Research minimum contribution benchmarks",  due: "2026-07-10", status: "open" },
      ],
      nextMeeting: "2026-07-15 at 18:00 EAT",
      aiConfidence: 94,
    },
    {
      chamaId: chamas[1]._id,
      title: "Jamii Q2 Planning Session",
      scheduledFor: daysAgo(10),
      durationMinutes: 35,
      status: "completed",
      attendees: ["Amina Mwangi", "Fatuma Hassan", "Peter Kibet"],
      transcript: [
        { speaker: "Amina Mwangi",   text: "Let's discuss Q2 goals for the fund.", spokenAt: daysAgo(10) },
        { speaker: "Fatuma Hassan",   text: "I think we should focus on agricultural investments this quarter.", spokenAt: daysAgo(10) },
        { speaker: "Peter Kibet",    text: "Agreed. I can research local poultry co-ops for potential partnerships.", spokenAt: daysAgo(10) },
      ],
      summary: "Q2 planning: agreed to focus on agricultural micro-investments. Fatuma proposed partnering with local co-ops. Peter will research options. Treasury balance TZS 35,000. All members in good standing.",
      decisions: [
        "Focus Q2 investments on agriculture sector",
        "Explore local co-op partnerships",
      ],
      actionItems: [
        { assignee: "Peter Kibet",   task: "Research poultry co-op partnerships", due: "2026-07-01", status: "open" },
        { assignee: "Fatuma Hassan",  task: "Prepare investment proposal for next meeting", due: "2026-07-08", status: "open" },
      ],
      nextMeeting: "2026-07-20 at 17:00 EAT",
      aiConfidence: 91,
    },
    {
      chamaId: chamas[0]._id,
      title: "Umoja Emergency — Loan Default Discussion",
      scheduledFor: daysAgo(21),
      durationMinutes: 28,
      status: "completed",
      attendees: ["Amina Mwangi", "Grace Njeri", "David Kamau"],
      transcript: [
        { speaker: "Amina Mwangi",  text: "We need to discuss the overdue repayment from last month.", spokenAt: daysAgo(21) },
        { speaker: "David Kamau",   text: "The member has been contacted. They've committed to a partial payment plan.", spokenAt: daysAgo(21) },
      ],
      summary: "Emergency meeting to address overdue loan repayment. Member agreed to partial payment plan over 3 months. Group will monitor compliance. No penalties imposed for now.",
      decisions: [
        "Accept partial repayment plan (3 monthly installments)",
        "No penalties at this stage",
        "Review compliance at next regular meeting",
      ],
      actionItems: [
        { assignee: "David Kamau", task: "Set up repayment tracking", due: "2026-06-15", status: "done" },
      ],
      nextMeeting: "Regular monthly meeting — July 2026",
      aiConfidence: 89,
    },
  ]);
  console.log(`   ✅ ${meetings.length} meetings created`);

  /* ── Summary ───────────────────────────────────────────────── */
  console.log("\n══════════════════════════════════════════════════════════");
  console.log("  🎉  ChamaTrust Database Seeded Successfully!");
  console.log("══════════════════════════════════════════════════════════");
  console.log(`  Database   : chamatrustdb`);
  console.log(`  Host       : localhost:27017`);
  console.log(`  Users      : ${users.length}`);
  console.log(`  Chamas     : ${chamas.length}`);
  console.log(`  Transactions: ${transactions.length}`);
  console.log(`  Loans      : ${loans.length}`);
  console.log(`  Meetings   : ${meetings.length}`);
  console.log("──────────────────────────────────────────────────────────");
  console.log("  Demo Login Credentials:");
  console.log("  ─────────────────────────");
  console.log("  Admin  : amina@chamatrust.demo / Demo@1234");
  console.log("  Member : joseph@chamatrust.demo / Demo@1234");
  console.log("  Auditor: david@chamatrust.demo / Demo@1234");
  console.log("══════════════════════════════════════════════════════════\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
