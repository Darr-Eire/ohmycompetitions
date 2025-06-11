
import { dbConnect } from 'lib/dbConnect';

import AuditLog from 'models/AuditLog';

export default async function handler(req, res) {
  await connectToDatabase();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.role || session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') return res.status(405).end();

  try {
    const logs = await AuditLog.find({});
    res.status(200).json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
}
