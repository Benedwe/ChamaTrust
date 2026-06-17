import express from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { Transaction } from "../models/Transaction.js";
import { flagTransaction } from "../services/fraud.js";
import { initiateCollection, initiatePayout, listProviders } from "../services/mobileMoney.js";

const router = express.Router();
const moneySchema = z.object({
  chamaId: z.string().optional(),
  provider: z.enum(["M-Pesa", "Airtel Money", "Tigo Pesa", "HaloPesa"]),
  phone: z.string().min(9),
  amount: z.number().positive()
});

router.get("/providers", (req, res) => {
  res.json({ providers: listProviders() });
});

router.post("/deposit", requireAuth, async (req, res) => {
  const input = moneySchema.parse(req.body);
  const result = await initiateCollection(input);
  const riskFlags = flagTransaction(input);
  const transaction = await Transaction.create({
    ...input,
    member: req.user.sub,
    direction: "deposit",
    reference: result.reference,
    status: result.status,
    riskFlags
  });

  res.status(202).json({ transaction, mobileMoney: result, flow: `${input.provider} -> Blockchain Wallet -> Chama Treasury` });
});

router.post("/withdraw", requireAuth, async (req, res) => {
  const schema = moneySchema.extend({ approvalTxHash: z.string().min(10) });
  const input = schema.parse(req.body);
  const result = await initiatePayout(input);
  const transaction = await Transaction.create({
    ...input,
    member: req.user.sub,
    direction: "withdrawal",
    reference: result.reference,
    status: result.status,
    txHash: input.approvalTxHash
  });

  res.status(202).json({ transaction, mobileMoney: result, flow: "Chama Treasury -> Blockchain Wallet -> Mobile Money" });
});

export default router;
