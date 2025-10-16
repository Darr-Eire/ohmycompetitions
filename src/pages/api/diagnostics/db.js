// src/pages/api/diagnostics/db.js
export const runtime = 'nodejs';
import { getDb } from 'lib/db.js';

export default async function handler(_req, res) {
  try {
    const db = await getDb();
    res.status(200).json({
      ok: true,
      name: db.databaseName,
      hasUri: Boolean(process.env.MONGODB_URI || process.env.MONGO_DB_URI || process.env.MONGO_DB_URL),
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
