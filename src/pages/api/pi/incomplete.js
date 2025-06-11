export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { payment } = req.body;

  try {
    // You can log it or reprocess it
    console.log('📌 Incomplete payment received:', payment);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Incomplete payment error:', err);
    res.status(500).json({ error: 'Could not process incomplete payment' });
  }
}
