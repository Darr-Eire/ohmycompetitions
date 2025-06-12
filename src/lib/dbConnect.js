import mongoose from 'mongoose';

let isConnected = false;

const dbConnect = async () => {
  if (isConnected) return;

  const uri = process.env.MONGO_DB_URL;
  if (!uri) throw new Error('❌ MONGO_DB_URL missing in .env');

  try {
    const db = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = db.connections[0].readyState;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
};

export default dbConnect;
