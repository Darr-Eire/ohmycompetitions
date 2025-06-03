import { connectToDatabase } from 'lib/dbConnect';
import Entry from 'models/Entry';
import AuditLog from '@models/AuditLog';


import { getRandomNumber } from 'utils/randomness';


export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') return res.status(405).end();

  const { competitionId } = req.body;
  const entries = await Entry.find({ competitionId });

  if (entries.length === 0) return res.status(400).json({ error: 'No entries.' });

  const winnerIndex = await getRandomNumber(0, entries.length - 1);
  const winner = entries[winnerIndex];

  const audit = await AuditLog.create({
    competitionId,
    randomnessSeed: winnerIndex.toString(),
    winnerEntryId: winner._id
  });

  res.status(200).json({ winner, audit });
}
