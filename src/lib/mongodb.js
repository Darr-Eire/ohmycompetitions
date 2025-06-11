import mongoose from 'mongoose';

let cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  const MONGO_DB_URL = process.env.MONGO_DB_URL;
  if (!MONGO_DB_URL) {
    throw new Error('❌ MONGO_DB_URL is missing in .env.local');
  }

  if (!cached.promise) {
    mongoose.set('strictQuery', true); // Optional: align with upcoming defaults
    cached.promise = mongoose.connect(MONGO_DB_URL, {
      bufferCommands: false,
    }).then((mongoose) => {
      console.log('✅ MongoDB connected');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
