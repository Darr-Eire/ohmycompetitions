import { requireAdmin } from '../_adminAuth';
import mongoose from 'mongoose';
import { dbConnect } from 'lib/dbConnect';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  
  const useMock = process.env.ADMIN_MOCK === '1';

  if (useMock) {
    const mock = [
      { userId: 'u1', username: 'piKing', referrals: 42 },
      { userId: 'u2', username: 'satoshi_pi', referrals: 28 },
      { userId: 'u3', username: 'ohmywinner', referrals: 21 },
      { userId: 'u4', username: 'alphaNode', referrals: 17 },
      { userId: 'u5', username: 'piStorm', referrals: 11 },
    ];
    return res.status(200).json(mock);
  }

  try {
    await dbConnect();
    const db = mongoose.connection;

    // Get top referrers by counting users they referred
    const top = await db.collection('users')
      .aggregate([
        { $match: { referredBy: { $type: 'string', $ne: '' } } },
        { $group: { _id: '$referredBy', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ])
      .toArray();

    // Get referrer usernames for display
    const referrerCodes = top.map(r => r._id);
    const referrers = await db.collection('users')
      .find({ referralCode: { $in: referrerCodes } })
      .project({ username: 1, referralCode: 1 })
      .toArray();

    // Map referral codes to usernames
    const referrerMap = {};
    referrers.forEach(r => {
      referrerMap[r.referralCode] = r.username;
    });

    // Format response
    const result = top.map(item => ({
      referralCode: item._id,
      username: referrerMap[item._id] || 'Unknown',
      referrals: item.count
    }));

    res.status(200).json(result);
  } catch (e) {
    console.error('admin referrals top error', e);
    res.status(500).json({ error: 'Server error' });
  }
}
