// pages/api/pi/complete.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { paymentId, txid } = req.body;
  try {
    const resp = await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      { txid },
      { headers: { Authorization: `Bearer ${process.env.PI_API_KEY}` } }
    );
    res.status(200).json(resp.data);
  } catch (e: any) {
    res.status(e.response?.status || 500).json({ error: e.message });
  }
}
