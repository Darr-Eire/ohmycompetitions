import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentId, txid } = req.body;

  if (!paymentId || !txid) {
    return res.status(400).json({ error: 'Missing paymentId or txid' });
  }

  try {
    const piRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid }),
    });

    if (!piRes.ok) {
      const text = await piRes.text();
      return res.status(500).json({ error: 'Failed to complete payment', detail: text });
    }

    const piData = await piRes.json();
    const { user_uid, metadata, amount } = piData.payment;

    await client.connect();
    const db = client.db('ohmycompetitions');

    const drawWeek = new Date().toISOString().slice(0, 10);
    const ticketId = Math.random().toString(36).substring(2, 12);

    await db.collection('tickets').insertOne({
      userId: user_uid,
      ticketId,
      competition: metadata?.competitionSlug || 'unknown',
      quantity: metadata?.quantity || 1,
      amount,
      drawWeek,
      status: 'active',
      paymentId,
      txid,
      createdAt: new Date(),
    });

    return res.status(200).json({ success: true, ticketId });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
