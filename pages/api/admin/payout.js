import dbConnect from '../../../utils/dbConnect';
import AuditLog from '../../../models/AuditLog';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'POST') return res.status(405).end();

  const { auditId, payoutTx } = req.body;
  await AuditLog.findByIdAndUpdate(auditId, { payoutTx });
  res.status(200).json({ success: true });
}
