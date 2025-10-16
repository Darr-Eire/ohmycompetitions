import mongoose from 'mongoose';

if (!global._omc_mongoose) global._omc_mongoose = { conn: null, promise: null };
const cached = global._omc_mongoose;

const URI = process.env.MONGODB_URI || process.env.MONGO_DB_URI || process.env.MONGO_DB_URL;
if (!URI) throw new Error('Missing Mongo URI');

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      family: 4,
    }).then(m => m).catch(err => { cached.promise = null; throw err; });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export async function getDb() {
  const conn = await dbConnect();
  return conn.connection.db;
}

export default dbConnect;
