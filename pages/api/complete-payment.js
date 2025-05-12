export default async function handler(req, res) {
  const { paymentId, txid } = req.body;
  console.log('✅ Completing payment:', paymentId, txid);
  // Optional: store this info in your DB
  return res.status(200).json({ success: true });
}
