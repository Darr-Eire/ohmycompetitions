// src/lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI ??
  process.env.MONGO_DB_URL ??
  '';

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI / MONGO_DB_URL');
}

/**
 * Mongoose 7 default will be strictQuery=false.
 * Set explicitly to silence the deprecation warning.
 * Flip to `true` if you want strict filtering behavior.
 */
mongoose.set('strictQuery', false);

/** Cache the connection across hot reloads / serverless invocations */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Use the global cache if present
const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };
global.mongoose = cached;

/** Connect (or reuse) and return the Mongoose instance */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    // You can add more options here if needed
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        // helpful in serverless
        bufferCommands: false,
        // pool & timeout tuning
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 10_000,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
