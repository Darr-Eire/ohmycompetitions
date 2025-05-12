export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Missing paymentId' });
    }

    // 🔐 Optional validation logic goes here
    console.log('🔐 Approving payment:', paymentId);

    // Simulate approval (your backend logic could check DB/user/etc.)
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Approve Payment Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
