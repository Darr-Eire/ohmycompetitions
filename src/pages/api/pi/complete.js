export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { paymentId, txid } = req.body;

  if (!paymentId || !txid) {
    return res.status(400).json({ error: 'Missing paymentId or txid' });
  }

  try {
    const response = await fetch('https://api.minepi.com/payments/complete', {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`, // Make sure this is set!
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentId, txid }),
    });

    const contentType = response.headers.get('content-type');
    const text = await response.text();

    // Try parse if it's JSON
    let result;
    try {
      result = contentType.includes('application/json') ? JSON.parse(text) : text;
    } catch (err) {
      console.error('❌ Failed to parse JSON response:', text);
      return res.status(500).json({ error: 'Invalid JSON from Pi API', raw: text });
    }

    if (!response.ok) {
      console.error('❌ Pi complete failed:', result);
      return res.status(response.status).json({ error: 'Pi complete failed', details: result });
    }

    console.log('✅ Payment complete result:', result);
    return res.status(200).json({ completed: true, result });
  } catch (error) {
    console.error('❌ Pi complete error:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}
