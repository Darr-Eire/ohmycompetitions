export const runtime = 'nodejs';

import { getDb } from 'lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const db = await getDb();

    const codeId = String(req.query.codeId || '');
    const query = codeId ? { codeId } : {};
    const doc = await db
      .collection('piCashActivity')
      .find(query)
      .sort({ updatedAt: -1 })
      .limit(1)
      .next();

    return res.status(200).json({ ok: true, doc: doc || null });
  } catch (err) {
    console.error('❌ [/api/pi-cash-code/activity] error:', err?.message || err);
    return res.status(500).json({ ok: false, error: 'DB_CONNECT_FAILED' });
  }
}
