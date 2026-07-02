import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import chamaRoutes from "./routes/chamas.js";
import governanceRoutes from "./routes/governance.js";
import loanRoutes from "./routes/loans.js";
import mobileMoneyRoutes from "./routes/mobileMoney.js";
import transactionRoutes from "./routes/transactions.js";
import ussdRoutes from "./routes/ussd.js";
import aiRoutes from "./routes/ai.js";
import meetingRoutes from "./routes/meetings.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { connectDB } from "./db.js";

const app = express();

// Vercel routes /api/* to this handler; strip prefix so Express routes match.
app.use((req, _res, next) => {
  if (process.env.VERCEL && req.url.startsWith("/api")) {
    req.url = req.url.slice(4) || "/";
  }
  next();
});

app.use(helmet());
app.use(
  cors({
    origin: process.env.WEB_ORIGIN
      ? process.env.WEB_ORIGIN.split(",").map((origin) => origin.trim())
      : process.env.VERCEL
        ? true
        : "http://localhost:5173",
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));
app.use(rateLimit({ windowMs: 60_000, limit: 120, validate: { ip: false } }));

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "chamatrust-api" });
});

app.use("/auth", authRoutes);
app.use("/chamas", chamaRoutes);
app.use("/governance", governanceRoutes);
app.use("/loans", loanRoutes);
app.use("/mobile-money", mobileMoneyRoutes);
app.use("/transactions", transactionRoutes);
app.use("/ussd", ussdRoutes);
app.use("/ai", aiRoutes);
app.use("/meetings", meetingRoutes);
app.use(errorHandler);

export default app;
