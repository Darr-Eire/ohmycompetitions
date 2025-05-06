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

    const client = await clientPromise;
    const db = client.db();
    const entries = db.collection('entries');

    // Optional: prevent duplicate entries
    const existing = await entries.findOne({ paymentId });
    if (existing) {
      return res.status(409).json({ error: 'Duplicate paymentId' });
    }

    // Save entry
    const entry = {
      paymentId,
      txid,
      userUid: uid,
      competitionSlug: 'ps5-bundle-giveaway', // TODO: make dynamic later
      status: 'confirmed',
      createdAt: new Date(),
    };

    await entries.insertOne(entry);

    return res.status(200).json({ success: true, message: 'Entry saved' });
  } catch (err) {
    console.error('❌ Error in complete.js:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
