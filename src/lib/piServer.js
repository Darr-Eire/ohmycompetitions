import crypto from 'crypto';

export function verifyPayment(payment, developerSecret) {
  const fields = [
    payment.identifier,
    payment.user_uid,
    payment.amount,
    payment.currency,
    payment.created_at,
  ];
  const payload = fields.join('|');
  const hmac = crypto
    .createHmac('sha256', developerSecret)
    .update(payload)
    .digest('hex');
  return hmac === payment.txn_signature;
}
