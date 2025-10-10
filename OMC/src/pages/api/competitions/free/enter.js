import { dbConnect } from 'lib/dbConnect';
import Competition from 'models/Competition';
import Entry from 'models/Entry';

const recentByIp = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await dbConnect();
    const { competitionSlug, username, proof } = req.body || {};
    if (!competitionSlug || !username) return res.status(400).json({ error: 'competitionSlug and username required' });

    const comp = await Competition.findOne({ 'comp.slug': competitionSlug }).lean();
    if (!comp) return res.status(404).json({ error: 'Competition not found' });
    if (comp.comp?.paymentType !== 'free') return res.status(400).json({ error: 'Not a free competition' });

    // Simple anti-abuse: rate limit by IP and one entry per user
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    if (recentByIp.has(ip) && now - recentByIp.get(ip) < 60_000) {
      return res.status(429).json({ error: 'Please wait before entering again' });
    }
    recentByIp.set(ip, now);

    const already = await Entry.findOne({ username, competitionSlug });
    if (already) return res.status(400).json({ error: 'Already entered' });

    // Store proof minimally (e.g., social platform and postId or URL)
    const proofSafe = proof && typeof proof === 'object' ? proof : {};

    await Entry.create({
      username,
      competitionSlug,
      earned: true,
      source: 'free_competition',
      metadata: { proof: proofSafe },
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('free competition enter error', e);
    res.status(500).json({ error: 'Server error' });
  }
}


