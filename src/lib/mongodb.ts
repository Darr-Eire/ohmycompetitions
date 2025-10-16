// src/lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_DB_URL as string;

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI / MONGO_DB_URL');
}

// ✅ Pick one:
mongoose.set('strictQuery', false); // recommended: matches Mongoose 7 default
// mongoose.set('strictQuery', true); // alternative: keep strict filters

let cached = (global as any).mongoose as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI, {
      // optional: tune timeouts for serverless
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
    }).then((m) => m);
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}
