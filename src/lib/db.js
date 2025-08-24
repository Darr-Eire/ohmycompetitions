import mongoose from 'mongoose';

mongoose.set('strictQuery', false);

const URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_DB_URI ||
  process.env.MONGO_DB_URL;

if (!URI) {
  throw new Error('Set MONGODB_URI (or MONGO_DB_URI / MONGO_DB_URL) in .env(.local)');
}

// Cache across hot reloads/serverless
let cached = global._omc_mongoose;
if (!cached) cached = (global._omc_mongoose = { conn: null, promise: null });

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      })
      .then((m) => {
        const c = m.connection;
        console.log(`✅ Mongo connected: ${c.host}/${c.name} (mongoose v${mongoose.version})`);
        return m;
      })
      .catch((err) => {
        console.error('[db] Connection error:', err?.message || err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

async function getDb() {
  const conn = await dbConnect();
  return conn.connection.db;
}

async function dbDisconnect() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

export default dbConnect;
export { dbConnect, getDb, dbDisconnect };
