// DEV-ONLY: seed a PiPayment so /pi/payments/complete can find it
import { dbConnect } from '../../../../lib/dbConnect';
import PiPayment from '../../../../models/PiPayment';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method-not-allowed' });

  // block in prod
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ ok: false, error: 'forbidden-in-production' });
  }

  try {
    await dbConnect();

    const {
      paymentId,
      username,
      userUid,
      slug,
      ticketQty = 1,
      // optional: stash the skill on memo/metadata so complete() can read if not provided again
      skillQuestion = null,
    } = req.body || {};

    if (!paymentId || !username || !userUid || !slug) {
      return res.status(400).json({
        ok: false,
        error: 'missing-fields',
        need: { paymentId: true, username: true, userUid: true, slug: true }
      });
    }

    // idempotent: don’t duplicate
    const existing = await PiPayment.findOne({ paymentId }).lean();
    if (existing) return res.status(200).json({ ok: true, already: true, paymentId });

    const memo = {
      slug,
      ticketQty,
      username,
      userUid,
      ...(skillQuestion ? { skillQuestion } : {})
    };

    const rec = await PiPayment.create({
      paymentId,
      status: 'pending',
      username,
      userUid,
      memo: JSON.stringify(memo),
      metadata: memo, // duplicate for convenience
      createdAt: new Date(),
    });

    return res.status(201).json({ ok: true, seeded: true, paymentId: rec.paymentId });
  } catch (e) {
    console.error('[mock-init] error:', e);
    return res.status(500).json({ ok: false, error: e.message || 'server-error' });
  }
}
