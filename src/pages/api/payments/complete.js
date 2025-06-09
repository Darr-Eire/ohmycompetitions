// /pages/api/complete.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { paymentId, txid } = req.body;

  try {
    const response = await fetch('https://api.minepi.com/payments/complete', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentId, txid }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Completion failed');

    res.status(200).json({ success: true, result });
  } catch (err: any) {
    console.error('Completion Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}