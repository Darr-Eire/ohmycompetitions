// pages/api/admin/voucher-stats.js
import { dbConnect } from '../../../lib/dbConnect';
import Voucher from '../../../models/Voucher';
import VoucherRedemption from '../../../models/VoucherRedemption';
import { requireAdmin } from './_adminAuth';

function isAdmin(req) {
  const admin = requireAdmin(req, {});
  return admin !== false;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });

  await dbConnect();
  const now = new Date();

  const [total, active, redeemed] = await Promise.all([
    Voucher.countDocuments({}),
    Voucher.countDocuments({
      $and: [
        { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
        { $expr: { $lt: ['$redeemedCount', '$maxRedemptions'] } }
      ]
    }),
    VoucherRedemption.countDocuments({})
  ]);

  res.json({ total, active, redeemed });
}
