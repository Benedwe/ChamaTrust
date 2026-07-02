import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./db.js";

const port = process.env.PORT || 8080;

async function start() {
  try {
    await connectDB();
    if (process.env.MONGODB_URI) {
      console.log("ChamaTrust API connected to MongoDB");
    }
  } catch (error) {
    console.warn("Failed to connect to MongoDB, proceeding with mock database:", error.message);
  }

  app.listen(port, () => {
    console.log(`ChamaTrust API listening on ${port}`);
  });
}

if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default app;
