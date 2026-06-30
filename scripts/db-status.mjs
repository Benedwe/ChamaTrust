/**
 * ChamaTrust — Database Status Check
 * ───────────────────────────────────
 * Quick health check for the MongoDB connection and data counts.
 *
 * Usage:  node scripts/db-status.js
 */

import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/chamatrustdb";

async function status() {
  console.log("🔗 Connecting to:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  console.log("✅ Connected to MongoDB", (await db.admin().serverInfo()).version);
  console.log(`📦 Database: ${db.databaseName}\n`);

  const collections = await db.listCollections().toArray();
  if (collections.length === 0) {
    console.log("  ⚠️  No collections found — run: npm run db:seed");
  } else {
    console.log("  Collection            Documents");
    console.log("  ──────────────────────────────────");
    for (const col of collections.sort((a, b) => a.name.localeCompare(b.name))) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  ${col.name.padEnd(22)} ${count}`);
    }
  }

  console.log();
  await mongoose.disconnect();
}

status().catch((err) => {
  console.error("❌ Cannot connect:", err.message);
  process.exit(1);
});
