export const runtime = 'nodejs';

import { getDb } from 'lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const db = await getDb();

    const limit = Math.min(Math.max(parseInt(String(req.query.limit || '10'), 10) || 10, 1), 100);

    const history = await db
      .collection('piCashHistory')
      .find({})
      .sort({ weekStart: -1 })
      .limit(limit)
      .toArray();

    const formatted = history.map((entry) => ({
      weekStart: entry.weekStart instanceof Date ? entry.weekStart.toISOString() : entry.weekStart ?? null,
      code: entry.code ?? null,
      winner: entry.winner || '—',
    }));

    return res.status(200).json({ ok: true, data: formatted });
  } catch (err) {
    console.error('❌ [/api/pi-cash-code/history] error:', err?.message || err);
    return res.status(500).json({ ok: false, error: 'DB_CONNECT_FAILED' });
  }
}
