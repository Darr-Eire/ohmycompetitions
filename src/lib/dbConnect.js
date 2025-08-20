// src/lib/db.js
import mongoose from 'mongoose';

mongoose.set('strictQuery', false);

// Accept either key so you don't get blocked by a mismatch
const URI = process.env.MONGO_DB_URL || process.env.MONGODB_URI;
if (!URI) {
  throw new Error('Missing MongoDB connection string: set MONGO_DB_URL or MONGODB_URI in .env.local');
}

// Global cache to survive Next.js hot reloads
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(URI, { bufferCommands: false }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// optional named export if you prefer
export { dbConnect };
