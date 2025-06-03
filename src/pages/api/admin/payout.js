import { connectToDatabase } from 'lib/dbConnect';
import AuditLog from '@models/AuditLog';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectToDatabase();

  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { auditId, payoutTx } = req.body;

  try {
    await AuditLog.findByIdAndUpdate(auditId, { payoutTx });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[PAYOUT UPDATE ERROR]', err);
    res.status(500).json({ error: 'Failed to update payout' });
  }
}
