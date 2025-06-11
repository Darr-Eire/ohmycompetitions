export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { payment } = req.body;

  try {
    console.log('🪵 Logging incomplete payment:', payment);

    // Optionally store to DB or track stuck ones here

    res.status(200).json({ logged: true });
  } catch (err) {
    console.error('❌ Logging error:', err);
    res.status(500).json({ error: 'Could not handle incomplete payment' });
  }
}
