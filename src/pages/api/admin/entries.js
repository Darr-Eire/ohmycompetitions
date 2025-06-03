import { connectToDatabase } from 'lib/dbConnect';
import AuditLog from '@models/AuditLog';




export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'GET') return res.status(405).end();

  const { competitionId } = req.query;
  const entries = await Entry.find({ competitionId });
  res.status(200).json(entries);
}
