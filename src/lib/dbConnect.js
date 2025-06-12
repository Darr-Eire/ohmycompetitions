import mongoose from 'mongoose';

let isConnected = false;

export async function dbConnect() {
  if (isConnected) return;

  const uri = process.env.MONGO_DB_URL;
  if (!uri) throw new Error('❌ MONGO_DB_URL is missing in .env.local');

  try {
    const db = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = db.connections[0].readyState;
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}
