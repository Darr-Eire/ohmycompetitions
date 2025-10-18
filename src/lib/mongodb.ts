// src/lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI ??
  process.env.MONGO_DB_URL ??
  '';

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI / MONGO_DB_URL');
}

// Silence the deprecation + match Mongoose 7 default
mongoose.set('strictQuery', false);
// Optional: only if you see a populate warning
// mongoose.set('strictPopulate', false);

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Attach to a NON-conflicting global key (avoid "mongoose")
declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis._mongoose ?? { conn: null, promise: null };
globalThis._mongoose = cached;

export default async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        // If you specify DB via env var:
        dbName: process.env.MONGODB_DB,
        // Good defaults for serverless/Next.js:
        bufferCommands: false,
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 10_000,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
