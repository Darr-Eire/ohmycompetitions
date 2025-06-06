// src/lib/dbConnect.js

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_DB_URL;  // ✅ use MONGO_DB_URL as requested

if (!MONGODB_URI) {
  throw new Error('⚠️ Please define the MONGO_DB_URL inside your environment variables.');
}

// Global cache to prevent re-opening connections in dev
let cached = global.mongoose || { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.set('strictQuery', false);  // ✅ prevent mongoose deprecation warning
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export { dbConnect };

