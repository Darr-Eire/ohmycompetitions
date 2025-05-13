export default async function handler(req, res) {
  const { paymentId } = req.body;
  const API_KEY = process.env.PI_API_KEY;

  try {
    const piRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!piRes.ok) {
      const error = await piRes.text();
      console.error('[❌] Pi completion failed:', error);
      return res.status(400).send(error);
    }

    const result = await piRes.json();
    console.log('[✅] Payment completed:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('[🔥] Completion error:', error);
    res.status(500).json({ error: 'Completion error' });
  }
}
