import { dbConnect } from 'lib/dbConnect';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await dbConnect();

    const db = mongoose.connection;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Helper to join grouped referralCode -> user doc
    const joinToUserStages = [
      {
        $lookup: {
          from: 'users',
          let: { refCode: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$referralCode', '$$refCode'] } } },
            { $project: { username: 1, profileImage: 1, country: 1, xp: 1 } },
          ],
          as: 'byCode',
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { refUser: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$username', '$$refUser'] } } },
            { $project: { username: 1, profileImage: 1, country: 1, xp: 1 } },
          ],
          as: 'byUsername',
        },
      },
      {
        $addFields: {
          user: { $first: { $concatArrays: ['$byCode', '$byUsername'] } },
        },
      },
      { $project: { byCode: 0, byUsername: 0 } },
      {
        $addFields: {
          username: { $ifNull: ['$user.username', 'Unknown'] },
          profileImage: '$user.profileImage',
          xp: '$user.xp',
          country: '$user.country',
        },
      },
      { $project: { user: 0 } },
    ];

    const allTime = await db.collection('users')
      .aggregate([
        { $match: { referredBy: { $type: 'string', $ne: '' } } },
        { $group: { _id: '$referredBy', count: { $sum: 1 } } },
        ...joinToUserStages,
        { $sort: { count: -1 } },
        { $limit: 50 },
      ])
      .toArray();

    const weekly = await db.collection('users')
      .aggregate([
        { $match: { referredBy: { $type: 'string', $ne: '' }, createdAt: { $gte: weekAgo } } },
        { $group: { _id: '$referredBy', count: { $sum: 1 } } },
        ...joinToUserStages,
        { $sort: { count: -1 } },
        { $limit: 50 },
      ])
      .toArray();

    res.status(200).json({ ok: true, allTime, weekly });
  } catch (err) {
    console.error('Referral leaderboard error:', err);
    res.status(500).json({ ok: false, error: 'Failed to build leaderboard' });
  }
}


