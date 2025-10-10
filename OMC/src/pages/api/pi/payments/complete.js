// src/pages/api/pi/payments/complete.js
import { dbConnect } from '../../../../lib/dbConnect';
import PiPayment from '../../../../models/PiPayment';
import { completePayment } from '../../../../lib/piClient'; // or '@/lib/piClient'


export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { paymentId, txid, accessToken } = req.body || {};
  if (!paymentId || !txid || !accessToken) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    await dbConnect();

    const rec = await PiPayment.findOne({ paymentId });
    if (!rec) return res.status(404).json({ message: 'Unknown paymentId' });
    if (rec.status === 'completed') return res.json({ ok: true, already: true });

    const done = await completePayment(paymentId, txid, accessToken);

    rec.status = 'completed';
    rec.txid = txid;
    rec.raw = done;
    await rec.save();

    // TODO: parse rec.memo and grant tickets/XP here

    return res.json({ ok: true, payment: done });
  } catch (e) {
    console.error('[api/pi/payments/complete]', e?.response?.data || e);
    return res.status(500).json({ message: 'Complete failed' });
  }
}


