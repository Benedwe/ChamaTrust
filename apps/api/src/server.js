import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
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

const app = express();
const port = process.env.PORT || 8080;

app.use(helmet());
app.use(cors({ origin: process.env.WEB_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));

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

async function start() {
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("ChamaTrust API connected to MongoDB");
  }

  app.listen(port, () => {
    console.log(`ChamaTrust API listening on ${port}`);
  });
}

if (process.env.NODE_ENV !== "test") {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default app;
