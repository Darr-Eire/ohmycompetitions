// src/lib/db.js
import mongoose from 'mongoose';

const URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_DB_URI ||
  process.env.MONGO_DB_URL;

if (!URI) {
  throw new Error('Set MONGODB_URI (or MONGO_DB_URI / MONGO_DB_URL) in .env.local');
}

let cached = global.mongooseConn;
if (!cached) cached = global.mongooseConn = { conn: null, promise: null };

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(URI, { bufferCommands: false })
      .then((m) => {
        const c = m.connection;
        console.log(
          `✅ Mongo connected to ${c.host}/${c.name} (driver v${mongoose.version})`
        );
        return m;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
