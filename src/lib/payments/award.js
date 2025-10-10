// src/lib/payments/award.js
import Ticket from '@/models/Ticket';
import Payment from '@/models/Payment';

export async function awardTicketsForPayment(piPayment) {
  const paymentId = piPayment?.identifier || piPayment?.id;
  if (!paymentId) throw new Error('No payment identifier');

  const exists = await Ticket.findOne({ paymentId });
  if (exists) return exists; // already awarded

  // derive user + quantity from metadata you set when creating the payment
  const { userId, quantity, competitionId } = piPayment?.metadata || {};
  // ... create tickets, update user balances, etc.

  await Payment.updateOne(
    { paymentId },
    { $set: { status: 'completed', raw: piPayment } },
    { upsert: true }
  );

  // return what UI needs
  return { ok: true };
}
