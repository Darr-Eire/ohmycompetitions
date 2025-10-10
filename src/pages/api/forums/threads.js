import { dbConnect } from '../../../lib/dbConnect';
import Thread from '../../../models/Thread';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category, limit = 20, page = 1 } = req.query;

  try {
    await dbConnect();

    const query = category && category !== 'all' ? { category } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const threads = await Thread.find(query)
      .sort({ isPinned: -1, lastActivity: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Thread.countDocuments(query);

    res.status(200).json({
      threads,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total
      }
    });
  } catch (error) {
    console.error('Error fetching threads:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 