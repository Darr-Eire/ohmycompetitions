export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    console.warn('❌ Missing paymentId in request');
    return res.status(400).json({ error: 'Missing paymentId' });
  }

  try {
   const piRes = await fetch(`https://sandbox.minepi.com/v2/payments/${paymentId}/approve`, {

      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const text = await piRes.text();
    console.log('🔍 Pi API response:', text);

    if (!piRes.ok) {
      return res.status(500).json({ error: 'Approval failed', detail: text });
    }

    const result = JSON.parse(text);
    console.log('✅ Pi payment approved:', result);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Internal error approving payment:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
