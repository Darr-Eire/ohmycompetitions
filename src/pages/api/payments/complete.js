export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentId, txid } = req.body;

  if (!paymentId || !txid) {
    return res.status(400).json({ error: 'Missing paymentId or txid' });
  }

  try {
    // Here you'd mark payment as completed in your DB
    console.log('✅ Payment completed:', { paymentId, txid });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Completion error:', error);
    return res.status(500).json({ error: 'Server error completing payment' });
  }
}
