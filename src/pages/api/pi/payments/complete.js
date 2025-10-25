// src/pages/api/pi/payments/complete.js

import { dbConnect } from '../../../../lib/dbConnect';
import PiPayment from '../../../../models/PiPayment';
import Competition from '../../../../models/Competition'; // if you increment tickets here
import { completePayment } from '../../../../lib/piClient'; // or '@/lib/piClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { paymentId, txid, accessToken, slug, ticketQty } = req.body || {};
  if (!paymentId || !txid) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    await dbConnect();

    const rec = await PiPayment.findOne({ paymentId });
    if (!rec) return res.status(404).json({ message: 'Unknown paymentId' });
    if (rec.status === 'completed') return res.json({ ok: true, already: true });

    // Complete on Pi Network (optional if you already did this elsewhere)
    const done = await completePayment(paymentId, txid, accessToken).catch(() => null);

    // Persist completion on our side
    rec.status = 'completed';
    rec.txid = txid;
    if (done) rec.raw = done;

    // Get slug/ticketQty from body OR memo/metadata as fallback
    let compSlug = slug;
    let qty = Number(ticketQty || 0);

    // Try memo as JSON {"slug":"...","ticketQty":1}
    if ((!compSlug || !qty) && typeof rec.memo === 'string') {
      try {
        const m = JSON.parse(rec.memo);
        if (!compSlug && m?.slug) compSlug = m.slug;
        if (!qty && m?.ticketQty) qty = Number(m.ticketQty);
      } catch {}
    }
    // Try metadata/meta on the record
    const meta = rec.metadata || rec.meta || {};
    if (!compSlug && meta.slug) compSlug = meta.slug;
    if (!qty && meta.ticketQty) qty = Number(meta.ticketQty);

    await rec.save();

    // Optionally increment tickets on the competition (atomic guard)
    if (compSlug && Number.isFinite(qty) && qty > 0) {
      await Competition.findOneAndUpdate(
        {
          'comp.slug': compSlug,
          $expr: { $lte: ['$comp.ticketsSold', { $subtract: ['$comp.totalTickets', qty] }] }
        },
        { $inc: { 'comp.ticketsSold': qty } },
        { new: true }
      );
    }

    return res.json({ ok: true, payment: done || null });
  } catch (e) {
    console.error('[api/pi/payments/complete]', e?.response?.data || e);
    return res.status(500).json({ message: 'Complete failed' });
  }
}
