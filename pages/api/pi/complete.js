import clientPromise from '@/lib/mongodb' // make sure you have this setup

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
    const db = client.db(); // default DB from your URI
    const entries = db.collection('entries');

    const entry = {
      paymentId,
      txid,
      userUid: uid,
      competitionSlug: 'ps5-bundle-giveaway',
      status: 'confirmed',
      createdAt: new Date(),
    };
    
