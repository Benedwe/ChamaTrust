import express from "express";
import jwt from "jsonwebtoken";
import { verifyMessage } from "ethers";
import { z } from "zod";

const router = express.Router();
const schema = z.object({
  address: z.string().min(10),
  message: z.string().min(8),
  signature: z.string().min(20)
});

router.post("/wallet", (req, res) => {
  const input = schema.parse(req.body);
  const recovered = verifyMessage(input.message, input.signature);

  if (recovered.toLowerCase() !== input.address.toLowerCase()) {
    return res.status(401).json({ error: "Wallet signature verification failed" });
  }

  const token = jwt.sign({ sub: recovered.toLowerCase(), wallet: recovered }, process.env.JWT_SECRET || "dev-secret", {
    expiresIn: "12h"
  });

  return res.json({ token, wallet: recovered });
});

export default router;
