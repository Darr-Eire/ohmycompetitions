// file: src/pages/api/funnel/live.js
import dbConnect from '../../../lib/dbConnect.js';
import FunnelCompetition from '../../../models/FunnelCompetition.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const stage = Number(req.query.stage || 1);
    if (![1, 2, 3, 4, 5].includes(stage)) {
      return res.status(400).json({ error: 'Invalid stage' });
    }

    const [filling, live] = await Promise.all([
      FunnelCompetition.find({ stage, status: 'filling' })
        .sort({ createdAt: 1 })
        .select('slug stage capacity advancing status entrantsCount startsAt endsAt imageUrl tags')
        .lean(),
      FunnelCompetition.find({ stage, status: 'live' })
        .sort({ startsAt: -1 })
        .select('slug stage capacity advancing status entrantsCount startsAt endsAt imageUrl tags')
        .lean(),
    ]);

    return res.status(200).json({
      summary: {
        stage,
        counts: { filling: filling.length, live: live.length, total: filling.length + live.length },
        timestamp: new Date().toISOString(),
      },
      filling,
      live,
    });
  } catch (e) {
    console.error('GET /api/funnel/live error', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
