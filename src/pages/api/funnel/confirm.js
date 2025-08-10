// file: src/pages/api/funnel/confirm.js
import { lobby } from '../../../lib/funnelLobby';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { slug, userId, stage, paymentId, txId } = req.body || {};
  if (!userId || !stage || !paymentId) return res.status(400).json({ error: 'Missing fields' });

  const rec = lobby.payments.get(paymentId);
  if (!rec) return res.status(404).json({ error: 'Payment not found' });

  lobby.payments.set(paymentId, { ...rec, status: 'completed', txId });

  // You could mark the user as paid in your DB here.
  return res.status(200).json({ ok: true });
}
