import express from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { Chama } from "../models/Chama.js";

const router = express.Router();
const createSchema = z.object({
  name: z.string().min(3),
  treasuryAddress: z.string().min(10),
  country: z.string().default("TZ"),
  currency: z.string().default("TZS"),
  minimumContribution: z.number().positive().default(10000),
  quorum: z.number().int().positive().default(3),
  phone: z.string().min(9)
});

router.get("/", async (req, res) => {
  const chamas = await Chama.find().sort({ createdAt: -1 }).limit(20);
  res.json({ chamas });
});

router.post("/", requireAuth, async (req, res) => {
  const input = createSchema.parse(req.body);
  const chama = await Chama.create({
    ...input,
    members: [{ walletAddress: req.user.sub, phone: input.phone, role: "admin", trustScore: 80 }]
  });

  res.status(201).json({ chama });
});

router.post("/:id/join", requireAuth, async (req, res) => {
  const schema = z.object({ phone: z.string().min(9) });
  const { phone } = schema.parse(req.body);
  const chama = await Chama.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { members: { walletAddress: req.user.sub, phone, role: "member", trustScore: 50 } } },
    { new: true }
  );

  res.json({ chama });
});

router.post("/:id/invite", requireAuth, async (req, res) => {
  const schema = z.object({
    walletAddress: z.string().min(5),
    phone: z.string().min(9)
  });
  const { walletAddress, phone } = schema.parse(req.body);

  const chama = await Chama.findById(req.params.id);
  if (!chama) {
    return res.status(404).json({ error: "Chama not found" });
  }

  const requester = chama.members.find(m => m.walletAddress.toLowerCase() === req.user.sub.toLowerCase());
  if (!requester || requester.role !== "admin") {
    return res.status(403).json({ error: "Only admins can invite members" });
  }

  if (chama.members.some(m => m.walletAddress.toLowerCase() === walletAddress.toLowerCase())) {
    return res.status(400).json({ error: "Member is already in the Chama" });
  }

  chama.members.push({
    walletAddress,
    phone,
    role: "member",
    trustScore: 50
  });

  await chama.save();
  res.json({ chama });
});

export default router;
