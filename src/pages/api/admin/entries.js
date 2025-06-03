import { connectToDatabase } from 'lib/dbConnect';
import Entry from '@models/Entry';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectToDatabase();

  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const { competitionId } = req.query;
  const entries = await Entry.find({ competitionId });
  res.status(200).json(entries);
}
