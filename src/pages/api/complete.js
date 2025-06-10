// pages/api/complete.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { paymentId, txid } = req.body;
  console.log('Completing payment:', paymentId, 'Transaction ID:', txid);

  // Your logic here (mark user as paid, issue ticket, etc.)

  res.status(200).json({ success: true });
}
