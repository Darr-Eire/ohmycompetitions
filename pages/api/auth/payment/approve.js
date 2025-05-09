export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'Missing paymentId' });
  }

  try {
    const piRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!piRes.ok) {
      const errorText = await piRes.text();
      console.error('❌ Pi approval failed:', errorText);
      return res.status(500).json({ error: 'Approval failed', detail: errorText });
    }

    const result = await piRes.json();
    console.log('✅ Payment approved:', result);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Internal error during approval:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
