import clientPromise from '../../../lib/mongo'; // <- adjust path to your mongo util

export default async function handler(req, res) {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const client = await clientPromise;
    const db = client.db(); // default DB

    // Find by uid or piUserId
    const user =
      (await db.collection('users').findOne({ uid: userId })) ||
      (await db.collection('users').findOne({ piUserId: userId })) ||
      (await db.collection('users').findOne({ username: userId }));

    // Defaults if not found
    const xp = user?.xp ?? 0;
    const level = user?.level ?? 1;

    // Basic linear next-level target if you don’t store nextLevelXP
    const nextLevelXP = user?.nextLevelXP ?? Math.max(100, level * 100);

    return res.json({ xp, level, nextLevelXP });
  } catch (e) {
    console.error('XP get error', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
