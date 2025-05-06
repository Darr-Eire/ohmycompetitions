// pages/api/pi/approve.js
export default async function handler(req, res) {
  const { paymentId } = req.body;
  const PI_API_KEY = process.env.PI_API_KEY;

  try {
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${PI_API_KEY}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Failed to approve');
    res.status(200).json({ message: 'Payment approved', data });
  } catch (error) {
    console.error('Approval error:', error.message);
    res.status(500).json({ error: 'Payment approval failed' });
  }
}
