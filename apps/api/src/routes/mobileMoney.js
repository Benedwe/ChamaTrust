import express from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { Transaction } from "../models/Transaction.js";
import { flagTransaction } from "../services/fraud.js";
import { initiateCollection, initiatePayout, listProviders } from "../services/mobileMoney.js";
import { verifyPesapalCallback, mapPesapalStatus, getPesapalMerchantReference, getPesapalStatus } from "../services/pesapal.js";

const router = express.Router();
const moneySchema = z.object({
  chamaId: z.string().optional(),
  provider: z.enum(["M-Pesa", "Airtel Money", "Tigo Pesa", "HaloPesa", "Pesapal"]),
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

router.post("/webhooks/pesapal", async (req, res) => {
  const isVerified = verifyPesapalCallback(req);
  const reference = getPesapalMerchantReference(req);
  const incomingStatus = getPesapalStatus(req);
  const mappedStatus = mapPesapalStatus(incomingStatus);

  console.log("Pesapal webhook received", {
    verified: isVerified,
    reference,
    incomingStatus,
    mappedStatus
  });

  if (!isVerified) {
    return res.status(401).json({ status: "invalid_signature" });
  }

  if (!reference) {
    return res.status(400).json({ status: "missing_reference" });
  }

  const transaction = await Transaction.findOne({ reference });
  if (!transaction) {
    return res.status(404).json({ status: "not_found" });
  }

  if (mappedStatus) {
    transaction.status = mappedStatus;
    await transaction.save();
  }

  return res.status(200).json({ status: "ok", transaction: { reference, status: transaction.status } });
});

export default router;
