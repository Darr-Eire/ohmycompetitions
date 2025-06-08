import mongoose from 'mongoose';

let cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const MONGO_URI = process.env.MONGO_DB_URL; // ✅ keep using MONGO_DB_URL

    if (!MONGO_URI) {
      throw new Error('Please define the MONGO_DB_URL environment variable');
    }

    mongoose.set('strictQuery', true);

    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(mongoose => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export { connectToDatabase };
