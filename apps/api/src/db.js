import mongoose from "mongoose";

const cached = global.mongoose ?? { conn: null, promise: null };
global.mongoose = cached;

/** Reuse a single MongoDB connection across Vercel serverless invocations. */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
