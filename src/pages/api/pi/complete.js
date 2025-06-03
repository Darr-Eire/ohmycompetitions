import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { connectToDatabase } from 'lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { paymentId, txid, competitionSlug } = req.body;
  const uid = session.user.uid;  // ✅ Take user UID directly from the session (never trust incoming uid from frontend)

  if (!paymentId || !txid || !competitionSlug) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const piRes = await fetch(`https://sandbox.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid }),
    });

    if (!piRes.ok) {
      const text = await piRes.text();
      return res.status(500).json({ error: 'Completion failed', detail: text });
    }

    const { db } = await connectToDatabase();

    await db.collection('entries').insertOne({
      uid,
      paymentId,
      txid,
      competitionSlug,
      status: 'confirmed',
      createdAt: new Date(),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Complete error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
