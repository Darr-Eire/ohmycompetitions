import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { paymentId, txid, uid } = req.body;

    if (!paymentId || !txid || !uid) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // ✅ Tell Pi servers to mark payment complete
    const piRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid }),
    });

    if (!piRes.ok) {
      const text = await piRes.text();
      console.error('❌ Pi completion failed:', text);
      return res.status(500).json({ error: 'Pi completion failed', detail: text });
    }

    // Save entry in MongoDB
    const client = await clientPromise;
    const db = client.db();
    const entries = db.collection('entries');

    await entries.insertOne({
      paymentId,
      txid,
      userUid: uid,
      competitionSlug: 'ps5-bundle-giveaway',
      status: 'confirmed',
      createdAt: new Date(),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Complete.js error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
