import { connectToDatabase } from 'lib/dbConnect';
import AuditLog from '@models/AuditLog';




export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'GET') return res.status(405).end();

  const payments = await Payment.aggregate([
    { $group: { _id: "$competitionId", total: { $sum: "$amount" } } }
  ]);

  res.status(200).json(payments);
}
