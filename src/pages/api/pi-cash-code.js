// /src/pages/api/pi-cash-code/index.js
import { dbConnect } from 'lib/dbConnect';
import PiCashCode from '../../models/PiCashCode'; // adjust path if needed

export default async function handler(req, res) {
  // Always disable caching for live game data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    await dbConnect();

    // Grab latest round; use lean so we return plain JSON (faster + safe)
    const doc = await PiCashCode.findOne({}, null, { sort: { createdAt: -1 } }).lean();

    if (!doc) {
      // Graceful empty state so UI still renders
      const empty = {
        code: null,
        dropAt: null,
        expiresAt: null,
        prizePool: 0,
        ticketsSold: 0,
        weekStart: null,
        serverNow: new Date().toISOString(),
      };
      return res.status(200).json(empty);
    }

    // Normalize/whitelist fields the UI actually needs
    const payload = {
      code: doc.code ?? null,
      dropAt: doc.dropAt ? new Date(doc.dropAt).toISOString() : null,
      expiresAt: doc.expiresAt ? new Date(doc.expiresAt).toISOString() : null,
      prizePool: Number.isFinite(doc.prizePool) ? Number(doc.prizePool) : 0,
      ticketsSold: Number.isFinite(doc.ticketsSold) ? Number(doc.ticketsSold) : 0,
      weekStart: doc.weekStart ?? null,
      // Drift-proof timer support
      serverNow: new Date().toISOString(),
    };

    return res.status(200).json(payload);
  } catch (err) {
    console.error('❌ PiCashCode fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch Pi Cash Code' });
  }
}
