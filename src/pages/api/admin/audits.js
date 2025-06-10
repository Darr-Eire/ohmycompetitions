import dbConnect from 'lib/dbConnect';
import AuditLog from 'models/AuditLog';
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

  const audits = await AuditLog.find({});
  res.status(200).json(audits);
}

