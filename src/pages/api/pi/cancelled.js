export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { paymentId } = req.body;

  try {
    console.log('⚠️ Payment cancelled:', paymentId);
    res.status(200).json({ cancelled: true });
  } catch (err) {
    console.error('❌ Cancel callback failed:', err);
    res.status(500).json({ error: 'Cancel failed' });
  }
}
