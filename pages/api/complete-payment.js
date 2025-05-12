export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { paymentId, txid } = req.body;

    if (!paymentId || !txid) {
      return res.status(400).json({ error: 'Missing paymentId or txid' });
    }

    // 🧾 Optional: Log, store, or validate the txid/payment
    console.log('✅ Completing payment:', { paymentId, txid });

    // Simulate marking the payment as completed
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Complete Payment Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
