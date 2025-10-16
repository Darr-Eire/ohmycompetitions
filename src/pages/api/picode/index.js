export const runtime = 'nodejs';



import { getDb } from 'lib/db.js';

export default async function handler(req, res) {
  const db = await getDb();

  if (req.method === 'GET') {
    const activeCode = await db.collection('pi_cash_codes').findOne(
      { expiresAt: { $gt: new Date() } },
      { sort: { weekStart: -1 } }
    );
    return res.status(200).json(activeCode);
  }

  if (req.method === 'POST') {
    // ðŸ” Authenticate & authorize admin
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { code, weekStart, expiresAt, drawAt, claimExpiresAt, prizePool } = req.body;

    if (!code || !weekStart || !expiresAt || !drawAt || !claimExpiresAt || !prizePool) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newCode = await db.collection('pi_cash_codes').insertOne({
      code,
      weekStart: new Date(weekStart),
      expiresAt: new Date(expiresAt),
      drawAt: new Date(drawAt),
      claimExpiresAt: new Date(claimExpiresAt),
      prizePool,
      claimed: false,
      winner: null,
      rolloverFrom: null,
    });

    return res.status(201).json({ id: newCode.insertedId });
  }

  return res.status(405).end();
}

