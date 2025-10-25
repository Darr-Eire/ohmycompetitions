// src/pages/api/pi/payments/complete.js
import { dbConnect } from '../../../../lib/dbConnect';
import PiPayment from '../../../../models/PiPayment';
import Competition from '../../../../models/Competition';
import { completePayment } from '../../../../lib/piClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // ✅ safe: inside handler
  console.log('[complete] HIT body:', req.body);

  const { paymentId, txid, accessToken, slug, ticketQty } = req.body || {};
  if (!paymentId || !txid) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    await dbConnect();

    const rec = await PiPayment.findOne({ paymentId });
    if (!rec) return res.status(404).json({ message: 'Unknown paymentId' });
    if (rec.status === 'completed') {
      return res.json({ ok: true, already: true });
    }

    // Optional: finalize on Pi (don’t block local completion if this fails)
    let done = null;
    try {
      done = await completePayment(paymentId, txid, accessToken);
    } catch (e) {
      console.warn('[complete] completePayment failed (continuing):', e?.response?.data || e?.message || e);
    }

    // Persist completion
    rec.status = 'completed';
    rec.txid = txid;
    if (done) rec.raw = done;

    // Pull slug/ticketQty from body → memo → metadata
    let compSlug = slug || null;
    let qty = Number(ticketQty || 0);

    if ((!compSlug || !qty) && typeof rec.memo === 'string') {
      try {
        const m = JSON.parse(rec.memo);
        if (!compSlug && m?.slug) compSlug = m.slug;
        if (!qty && m?.ticketQty) qty = Number(m.ticketQty);
      } catch {}
    }
    const meta = rec.metadata || rec.meta || {};
    if (!compSlug && meta.slug) compSlug = meta.slug;
    if (!qty && meta.ticketQty) qty = Number(meta.ticketQty);

    await rec.save();

    // Atomically increment tickets (guard oversell)
    let updatedComp = null;
    if (compSlug && Number.isFinite(qty) && qty > 0) {
      updatedComp = await Competition.findOneAndUpdate(
        {
          $or: [{ 'comp.slug': compSlug }, { slug: compSlug }],
          $expr: { $lte: ['$comp.ticketsSold', { $subtract: ['$comp.totalTickets', qty] }] },
        },
        { $inc: { 'comp.ticketsSold': qty } },
        {
          new: true,
          projection: { _id: 0, 'comp.ticketsSold': 1, 'comp.totalTickets': 1, 'comp.slug': 1, slug: 1 },
        }
      );
      if (!updatedComp) {
        console.warn('[complete] comp update skipped (guard failed or not found)', { compSlug, qty });
      }
    } else {
      console.warn('[complete] missing compSlug/qty, not updating comp', { compSlug, qty });
    }

    return res.json({
      ok: true,
      payment: done || null,
      competition: updatedComp
        ? {
            slug: updatedComp?.comp?.slug || updatedComp?.slug || compSlug,
            ticketsSold: updatedComp?.comp?.ticketsSold ?? null,
            totalTickets: updatedComp?.comp?.totalTickets ?? null,
          }
        : null,
    });
  } catch (e) {
    console.error('[api/pi/payments/complete]', e?.response?.data || e);
    return res.status(500).json({ message: 'Complete failed' });
  }
}
