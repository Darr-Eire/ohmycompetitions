// src/pages/api/pi-cash-code.js

import { connectToDatabase } from 'lib/mongodb';
import PiCashCode from '@models/PiCashCode';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await connectToDatabase();

    const now = new Date();

    // Find the active Pi Cash Code
    let code = await PiCashCode.findOne({
      expiresAt: { $gt: now }
    }).sort({ weekStart: -1 });

    if (!code) {
      console.warn('[WARN] No active Pi Cash Code found');
      return res.status(404).json({ error: 'No active code found' });
    }

    res.status(200).json({
      code: code.code,
      prizePool: code.prizePool,
      expiresAt: code.expiresAt?.toISOString(),
      weekStart: code.weekStart?.toISOString(),
      tickets: code.tickets?.length || 0
    });
  } catch (err) {
    console.error('[ERROR] /api/pi-cash-code:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
