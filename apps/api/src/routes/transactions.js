import express from "express";
import { Transaction } from "../models/Transaction.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(100);
  res.json({ transactions });
});

router.get("/:reference", async (req, res) => {
  const transaction = await Transaction.findOne({ reference: req.params.reference });
  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  return res.json({ transaction });
});

export default router;
