import { connectToDatabase } from 'lib/dbConnect';

import Entry from 'models/Entry';
import { generateEntryHash } from 'utils/hash';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectToDatabase();

  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { competitionId } = req.body;

  if (!competitionId) {
    return res.status(400).json({ error: 'Missing competitionId' });
  }

  const userId = session.user.id;
  const timestamp = Date.now();
  const entryHash = generateEntryHash(competitionId, userId, timestamp);

  try {
    const entry = await Entry.create({
      competitionId,
      userId,
      timestamp,
      entryHash
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error('[ENTRY CREATE ERROR]', err);
    res.status(500).json({ error: 'Failed to create entry' });
  }
}
