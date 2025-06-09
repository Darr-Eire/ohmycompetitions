import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { paymentId } = req.body;

  try {
    const response = await fetch('https://api.minepi.com/payments/approve', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentId }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Approval failed');

    res.status(200).json({ success: true, result });
  } catch (err: any) {
    console.error('Approval Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}