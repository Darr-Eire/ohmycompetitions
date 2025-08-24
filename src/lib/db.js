// src/lib/db.js
import mongoose from 'mongoose';

mongoose.set('strictQuery', false);

const URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_DB_URL ||
  process.env.MONGO_DB_URI;

if (!URI) {
  throw new Error('❌ Set MONGODB_URI (or MONGO_DB_URL / MONGO_DB_URI) in .env(.local)');
}

// Global cache survives hot reloads / serverless invocations
let cached = global._omc_mongoose;
if (!cached) {
  cached = global._omc_mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        // Optionally set dbName if your URI lacks one:
        // dbName: process.env.MONGODB_DB || 'ohmycompetitions',
      })
      .then((m) => {
        const c = m.connection;
        console.log(`✅ MongoDB connected: ${c.host}/${c.name} (mongoose v${mongoose.version})`);
        return m;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err?.message || err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Handy helper for native driver access if needed
async function getDb() {
  const conn = await dbConnect();
  return conn.connection.db;
}

export default dbConnect;
export { dbConnect, getDb };
