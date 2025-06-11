import { dbConnect } from 'lib/dbConnect';

import Entry from 'models/Entry';
import User from 'models/User';
import { getServerSession } from 'next-auth';


export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectToDatabase();
  const session = await getServerSession(req, res, authOptions);
  const fromUid = session?.user?.uid;
  if (!fromUid) return res.status(401).json({ error: 'Unauthorized' });

  const { toUid, competitionId, quantity } = req.body;
  if (!toUid || !competitionId || quantity < 1)
    return res.status(400).json({ error: 'Missing fields' });

  // Count sender's available tickets
  const owned = await Entry.aggregate([
    { $match: { userUid: fromUid, competitionId } },
    { $group: { _id: null, total: { $sum: '$quantity' } } },
  ]);

  const gifted = await Entry.aggregate([
    { $match: { giftedByUid: fromUid, competitionId } },
    { $group: { _id: null, total: { $sum: '$quantity' } } },
  ]);

  const available = (owned[0]?.total || 0) - (gifted[0]?.total || 0);
  if (available < quantity)
    return res.status(400).json({ error: 'Not enough available tickets' });

  const competitionName = (
    await Entry.findOne({ userUid: fromUid, competitionId }).select('competitionName')
  )?.competitionName || 'Unknown';

  await Entry.create({
    userUid: toUid,
    competitionId,
    competitionName,
    quantity,
    status: 'Pending',
    giftedByUid: fromUid,
    createdAt: new Date(),
  });

  res.status(200).json({ success: true });
}
