import express from "express";
import { nanoid } from "nanoid";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { Loan } from "../models/Loan.js";
import { analyzeLoanRisk } from "../services/reputation.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const loans = await Loan.find().sort({ createdAt: -1 }).limit(50);
    res.json({ loans });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      chamaId: z.string(),
      amount: z.number().positive(),
      purpose: z.string().min(3),
      trustScore: z.number().min(0).max(100).default(70),
      averageContribution: z.number().positive().default(100000)
    });
    const input = schema.parse(req.body);
    const risk = analyzeLoanRisk(input);
    const loan = await Loan.create({
      chamaId: input.chamaId,
      borrower: req.user.sub,
      amount: input.amount,
      purpose: input.purpose,
      riskLevel: risk.level,
      proposalId: `LN-${nanoid(8).toUpperCase()}`
    });

    res.status(201).json({ loan, advisor: risk });
  } catch (err) {
    if (err?.name === "ZodError") {
      return res.status(400).json({ error: err.errors[0]?.message || "Validation failed" });
    }
    next(err);
  }
});

export default router;
