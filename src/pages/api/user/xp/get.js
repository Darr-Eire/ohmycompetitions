import { dbConnect } from 'lib/dbConnect';
import User from 'models/User';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await dbConnect();

    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    // resolve by uid, piUserId, or username (your app uses all three in places)
    const user =
      (await User.findOne({ uid: userId }).lean()) ||
      (await User.findOne({ piUserId: userId }).lean()) ||
      (await User.findOne({ username: userId }).lean());

    const xp = user?.xp ?? 0;
    const level = user?.level ?? 1;
    const nextLevelXP = user?.nextLevelXP ?? Math.max(100, level * 100);

    return res.status(200).json({ xp, level, nextLevelXP });
  } catch (err) {
    console.error('❌ /api/user/xp/get error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
