export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { payment } = req.body;

  try {
    console.log('🔁 Handling stale/incomplete payment:', payment);
    // Optionally cancel it, or approve/complete if valid
    // You can also log it in MongoDB for manual inspection

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Failed to handle incomplete payment:', err);
    res.status(500).json({ error: 'Failed to handle payment' });
  }
}
