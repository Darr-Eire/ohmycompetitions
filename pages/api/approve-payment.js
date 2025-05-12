export default async function handler(req, res) {
  const { paymentId } = req.body;
  const appPrivateKey = process.env.PI_APP_PRIVATE_KEY;

  try {
    const response = await fetch('https://api.minepi.com/v2/payments', {
      method: 'POST',
      headers: {
        Authorization: `Key ${appPrivateKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentId }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Approval failed:', err);
    res.status(500).json({ error: 'Payment approval failed' });
  }
}
