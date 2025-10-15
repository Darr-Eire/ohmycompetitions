// /src/pages/api/diagnostics/mongo.js
import mongoose from 'mongoose';
export default async function handler(req, res) {
  const URI = process.env.MONGODB_URI || process.env.MONGO_DB_URL;
  if (!URI) {
    return res.status(500).json({
      ok: false,
      step: 'env',
      vars: {
        MONGODB_URI: !!process.env.MONGODB_URI,
        MONGO_DB_URL: !!process.env.MONGO_DB_URL,
        MONGODB_DB: !!process.env.MONGODB_DB,
      },
      msg: 'No Mongo URI found in Vercel env.'
    });
  }
  const redacted = URI.replace(/\/\/(.*?):(.*?)@/, '//$1:*****@');
  try {
    const conn = await mongoose.connect(URI, { serverSelectionTimeoutMS: 6000, connectTimeoutMS: 6000 });
    const info = { host: conn.connection.host, name: conn.connection.name, user: conn.connection.user };
    await mongoose.disconnect();
    res.status(200).json({ ok: true, uriRedacted: redacted, info });
  } catch (e) {
    res.status(500).json({ ok: false, step: 'connect', uriRedacted: redacted, msg: e.message, code: e.code, codeName: e.codeName });
  }
}
