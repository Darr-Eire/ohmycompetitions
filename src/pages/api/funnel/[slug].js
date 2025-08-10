import dbConnect from '../../../lib/dbConnect.js';
import FunnelCompetition from '../../../models/FunnelCompetition.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await dbConnect();
    const { slug } = req.query;
    const comp = await FunnelCompetition.findOne({ slug })
      .select('-entrants') // fetch with entrants only when needed
      .lean();
    if (!comp) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json({ comp });
  } catch (e) {
    console.error('GET /api/funnel/[slug] error', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
