// /pages/api/pi/approve.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { paymentId, uid, competitionSlug, amount } = req.body;

  try {
    const response = await fetch('https://api.minepi.com/payments/approve', {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId,
        metadata: { uid, competitionSlug, amount },
      }),
    });

    const raw = await response.text(); // capture full response, even if not JSON
    console.log('🔍 Raw Pi API response:', raw);

    const data = JSON.parse(raw);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Approval failed', details: data });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('❌ Server error:', err.message);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}
