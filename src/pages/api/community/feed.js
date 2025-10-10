import { dbConnect } from 'lib/dbConnect';
import Competition from 'models/Competition';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await dbConnect();

    const recentCompetitions = await Competition.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const completedWithWinners = await Competition.find({ 'comp.status': 'completed' })
      .sort({ 'comp.completedAt': -1 })
      .limit(10)
      .lean();

    const feed = [];

    recentCompetitions.forEach(c => {
      feed.push({
        type: 'new_competition',
        title: c.title,
        slug: c.comp?.slug,
        imageUrl: c.thumbnail || c.imageUrl,
        createdAt: c.createdAt,
      });
    });

    completedWithWinners.forEach(c => {
      (c.winners || []).forEach(w => {
        feed.push({
          type: 'winner',
          competition: c.title,
          username: w.username,
          ticketNumber: w.ticketNumber,
          createdAt: c.comp?.completedAt || c.updatedAt || c.createdAt,
        });
      });
    });

    feed.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.status(200).json({ ok: true, feed: feed.slice(0, 20) });
  } catch (err) {
    console.error('community feed error', err);
    res.status(500).json({ error: 'Server error' });
  }
}


