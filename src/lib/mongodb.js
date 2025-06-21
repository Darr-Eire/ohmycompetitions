import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_DB_URL;

if (!MONGODB_URI) {
  throw new Error('❌ Please define the MONGO_DB_URL inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// This gives you compatible "clientPromise" for old code that imports it
export const clientPromise = connectToDatabase;
