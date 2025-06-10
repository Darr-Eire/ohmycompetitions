import mongoose from 'mongoose';

let cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const MONGO_URI = process.env.MONGO_DB_URL;
    if (!MONGO_URI) throw new Error('❌ MONGO_DB_URL env var is missing');

    mongoose.set('strictQuery', true);

    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
