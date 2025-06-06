import { connectToDatabase } from 'lib/dbConnect';
import AuditLog from 'models/AuditLog';






export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'POST') return res.status(405).end();

  const { competitionId, userId, amount, piTxId } = req.body;
  const payment = await Payment.create({ competitionId, userId, amount, piTxId });
  res.status(201).json(payment);
}
