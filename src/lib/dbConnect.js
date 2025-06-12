import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_DB_URL;
if (!MONGO_URI) throw new Error('❌ MONGO_DB_URL is missing');

let cached = global.mongoose || { conn: null, promise: null };

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
