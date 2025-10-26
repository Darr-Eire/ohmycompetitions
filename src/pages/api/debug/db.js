// src/pages/api/debug/db.js
import { dbConnect } from '../../../lib/dbConnect';

export default async function handler(req, res) {
  try {
    const conn = await dbConnect();
    res.json({
      ok: true,
      host: conn.connection.host,
      name: conn.connection.name,
      readyState: conn.connection.readyState,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
