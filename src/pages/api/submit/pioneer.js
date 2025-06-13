import { connectToDatabase } from 'lib/mongodb';
import PioneerNomination from 'models/PioneerNomination';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, reason } = req.body;
  if (!name || !reason) return res.status(400).json({ error: 'Missing fields' });

  await connectToDatabase();
  const saved = await PioneerNomination.create({ name, reason });

  res.status(200).json({ message: 'Nomination submitted', data: saved });
}
