import dbConnect from 'lib/dbConnect';
import Entry from 'models/Entry';
import { generateEntryHash } from 'utils/hash';


export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') return res.status(405).end();

  const { competitionId, userId } = req.body;
  const timestamp = Date.now();
  const entryHash = generateEntryHash(competitionId, userId, timestamp);

  const entry = await Entry.create({ competitionId, userId, timestamp, entryHash });
  res.status(201).json(entry);
}
