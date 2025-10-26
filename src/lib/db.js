// src/lib/db.js
import mongoose from 'mongoose';

// Prevent multiple connections in dev / HMR
if (!global._omc_mongoose) {
  global._omc_mongoose = { conn: null, promise: null };
}
const cached = global._omc_mongoose;

// Load URI safely
const URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_DB_URI ||
  process.env.MONGO_DB_URL;

if (!URI) {
  throw new Error('❌ Missing Mongo URI (MONGODB_URI / MONGO_DB_URI / MONGO_DB_URL)');
}

// ✅ Recommended global config (Mongoose 7+)
mongoose.set('strictQuery', true);

// 🪵 Optional: enable this by setting MONGOOSE_DEBUG=1
if (process.env.MONGOOSE_DEBUG === '1') {
  mongoose.set('debug', true);
  console.log('🟢 Mongoose debug mode enabled');
}

export async function dbConnect() {
  // Reuse cached connection if available
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    console.log('⏳ Connecting to MongoDB...');
    cached.promise = mongoose
      .connect(URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
        socketTimeoutMS: 45000,
        family: 4,
        maxPoolSize: 10,
      })
      .then((m) => {
        console.log('✅ MongoDB connected:', m.connection.host);
        return m;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message);
        cached.promise = null; // Reset promise to allow retry
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export async function getDb() {
  const conn = await dbConnect();
  return conn.connection.db;
}

export default dbConnect;
