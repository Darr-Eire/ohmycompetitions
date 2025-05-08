import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGODB_URI

if (!MONGO_URI) throw new Error('MONGODB_URI not set in .env')

let cached = global.mongoose
if (!cached) cached = global.mongoose = { conn: null, promise: null }

export default async function dbConnect() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    }).then(m => m)
  }
  cached.conn = await cached.promise
  return cached.conn
}
