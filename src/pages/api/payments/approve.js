export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'Missing paymentId' });
  }

  try {
    // Here you would verify payment intent from your DB if applicable
    // You can log or store the approval if needed
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Approve error:', error);
    return res.status(500).json({ error: 'Server error approving payment' });
  }
}
