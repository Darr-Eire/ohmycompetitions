// src/pages/api/pi/payments/complete.js
'use server';

import { dbConnect } from '../../../../lib/dbConnect';
import PiPayment from '../../../../models/PiPayment';
import Competition from '../../../../models/Competition'; // ⬅️ add this
import { completePayment } from '../../../../lib/piClient'; // or '@/lib/piClient'

// Safe helpers
const toInt = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : d;
};
function extractMeta(rec, body) {
  // Try body first, then rec.memo (JSON), then rec.meta
  let meta = { ...(body || {}) };

  // memo may be a JSON string; if so, parse it
  if (!meta.slug || !meta.ticketQty) {
    try {
      if (rec?.memo && typeof rec.memo === 'string' && rec.memo.trim().startsWith('{')) {
        const memoObj = JSON.parse(rec.memo);
        meta = { ...memoObj, ...meta };
      }
    } catch {}
  }

  // legacy place
  if (!meta.slug && rec?.meta?.slug) meta.slug = rec.meta.slug;
  if (!meta.ticketQty && rec?.meta?.ticketQty) meta.ticketQty = rec.meta.ticketQty;

  // Normalize & defaults
  meta.slug = String(meta.slug || '').trim();
  meta.ticketQty = toInt(meta.ticketQty || 1, 1);

  return meta;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { paymentId, txid, accessToken } = req.body || {};
  if (!paymentId || !txid || !accessToken) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    await dbConnect();

    // 1) Load our recorded payment
    const rec = await PiPayment.findOne({ paymentId });
    if (!rec) return res.status(404).json({ message: 'Unknown paymentId' });

    // 2) If we already completed earlier, return success + current totals (best effort)
    if (rec.status === 'completed') {
      // Try to include freshest counter if we can find the competition
      const { slug } = extractMeta(rec, req.body);
      let counters = {};
      if (slug) {
        const comp = await Competition.findOne({ slug }).select('slug comp.ticketsSold comp.totalTickets');
        if (comp) {
          counters = {
            slug: comp.slug,
            ticketsSold: comp.comp?.ticketsSold ?? 0,
            totalTickets: comp.comp?.totalTickets ?? 0,
          };
        }
      }
      return res.json({ ok: true, already: true, ...counters });
    }

    // 3) Complete with Pi (KEEP your working flow)
    const done = await completePayment(paymentId, txid, accessToken);

    // 4) Mark our payment row as completed
    rec.status = 'completed';
    rec.txid = txid;
    rec.raw = done;
    await rec.save();

    // 5) Extract competition + qty info from body/memo/meta
    const { slug, ticketQty } = extractMeta(rec, req.body);
    if (!slug) {
      // We completed the payment but don't know which competition to bump.
      // Return OK so client can still refresh UI; admin logs will show the memo if needed.
      return res.json({ ok: true, payment: done, warn: 'No competition slug in memo/body' });
    }

    // 6) ATOMICALLY increment comp.ticketsSold (no oversell)
    //    Only increment if current ticketsSold <= totalTickets - ticketQty
    const updated = await Competition.findOneAndUpdate(
      {
        slug,
        $expr: {
          $lte: [
            '$comp.ticketsSold',
            { $subtract: ['$comp.totalTickets', ticketQty] }
          ]
        }
      },
      { $inc: { 'comp.ticketsSold': ticketQty } },
      { new: true, projection: { slug: 1, 'comp.ticketsSold': 1, 'comp.totalTickets': 1 } }
    );

    // If no doc matched, we likely hit sold out or slug mismatch.
    if (!updated) {
      // Optionally: you could roll back payment here (refund) or just report the condition.
      return res.status(409).json({
        ok: false,
        error: 'Sold out or cannot reserve tickets',
        slug,
        ticketQty
      });
    }

    // 7) Return fresh counters so the client can update instantly
    return res.json({
      ok: true,
      payment: done,
      slug: updated.slug,
      ticketsSold: updated.comp?.ticketsSold ?? 0,
      totalTickets: updated.comp?.totalTickets ?? 0
    });
  } catch (e) {
    console.error('[api/pi/payments/complete]', e?.response?.data || e);
    return res.status(500).json({ message: 'Complete failed' });
  }
}
