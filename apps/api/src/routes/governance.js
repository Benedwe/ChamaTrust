import express from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { Loan } from "../models/Loan.js";

const router = express.Router();

router.post("/loans/:id/vote", requireAuth, async (req, res) => {
  const schema = z.object({ support: z.boolean(), reason: z.string().optional(), txHash: z.string().optional() });
  const vote = schema.parse(req.body);
  const loan = await Loan.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { votes: { voter: req.user.sub, ...vote } } },
    { new: true }
  );

  res.json({ loan });
});

export default router;
