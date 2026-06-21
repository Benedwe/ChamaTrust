import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyMessage } from "ethers";
import { z } from "zod";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, walletAddress: user.walletAddress, role: user.role },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
}

function safeUser(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    walletAddress: user.walletAddress,
    role: user.role,
  };
}

/* ── POST /auth/register ─────────────────────────────────── */
const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email:    z.string().email("Enter a valid email"),
  phone:    z.string().min(7, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

router.post("/register", async (req, res) => {
  try {
    const input = registerSchema.parse(req.body);

    const existing = await User.findOne({ email: input.email });
    if (existing) return res.status(409).json({ error: "An account with this email already exists." });

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await User.create({ ...input, passwordHash });

    const token = signToken(user);
    return res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    if (err?.name === "ZodError") {
      return res.status(400).json({ error: err.errors[0]?.message || "Validation failed" });
    }
    return res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

/* ── POST /auth/login ────────────────────────────────────── */
const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  try {
    const input = loginSchema.parse(req.body);

    const user = await User.findOne({ email: input.email });
    if (!user) return res.status(401).json({ error: "Invalid email or password." });

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password." });

    const token = signToken(user);
    return res.json({ token, user: safeUser(user) });
  } catch (err) {
    if (err?.name === "ZodError") {
      return res.status(400).json({ error: "Please enter a valid email and password." });
    }
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
});

/* ── POST /auth/link-wallet (protected) ──────────────────── */
const walletLinkSchema = z.object({
  address:   z.string().min(10),
  message:   z.string().min(8),
  signature: z.string().min(20),
});

router.post("/link-wallet", requireAuth, async (req, res) => {
  try {
    const input = walletLinkSchema.parse(req.body);
    const recovered = verifyMessage(input.message, input.signature);

    if (recovered.toLowerCase() !== input.address.toLowerCase()) {
      return res.status(401).json({ error: "Wallet signature verification failed." });
    }

    const user = await User.findByIdAndUpdate(
      req.user.sub,
      { walletAddress: recovered.toLowerCase() },
      { new: true }
    );

    const token = signToken(user);
    return res.json({ token, user: safeUser(user) });
  } catch (err) {
    if (err?.name === "ZodError") {
      return res.status(400).json({ error: "Invalid wallet data." });
    }
    return res.status(500).json({ error: "Could not link wallet." });
  }
});

/* ── POST /auth/wallet (legacy — kept for compat) ────────── */
const legacySchema = z.object({
  address:   z.string().min(10),
  message:   z.string().min(8),
  signature: z.string().min(20),
});

router.post("/wallet", (req, res) => {
  try {
    const input = legacySchema.parse(req.body);
    const recovered = verifyMessage(input.message, input.signature);
    if (recovered.toLowerCase() !== input.address.toLowerCase()) {
      return res.status(401).json({ error: "Wallet signature verification failed" });
    }
    const token = jwt.sign(
      { sub: recovered.toLowerCase(), wallet: recovered },
      JWT_SECRET,
      { expiresIn: "12h" }
    );
    return res.json({ token, wallet: recovered });
  } catch {
    return res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
