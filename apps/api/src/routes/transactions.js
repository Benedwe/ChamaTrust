import express from "express";
import { Transaction } from "../models/Transaction.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(100);
    res.json({ transactions });
  } catch (err) {
    next(err);
  }
});

router.get("/:reference", async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ reference: req.params.reference });
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    return res.json({ transaction });
  } catch (err) {
    next(err);
  }
});

export default router;
