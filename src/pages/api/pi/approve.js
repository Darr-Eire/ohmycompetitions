// /src/pages/api/pi/approve.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { paymentId, uid, competitionSlug, amount } = req.body;

  if (!paymentId || !uid || !competitionSlug || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch(`https://api.minepi.com/payments/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`, // must be set in .env.local
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId,
        metadata: {
          uid,
          competitionSlug,
          amount,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Approval failed:', data);
      return res.status(500).json({ error: 'Approval failed', raw: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Server error during approval:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}
