// pages/api/pi-cash-code.js

import { getDb } from '@/lib/mongodb';

export default async function handler(req, res) {
  const db = await getDb();

  if (req.method === 'GET') {
    // Fetch the most recent active Pi Cash Code
    const code = await db
      .collection('pi_cash_codes')
      .findOne(
        { expiresAt: { $gt: new Date() } }, // active code (expiresAt > current date)
        { sort: { weekStart: -1 } } // fetch the latest code based on weekStart
      );

    if (!code) {
      return res.status(404).json({ error: 'No active code found' });
    }

    return res.status(200).json(code);
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

