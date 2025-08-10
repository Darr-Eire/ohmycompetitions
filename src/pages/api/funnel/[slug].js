import { dbConnect } from '../../../lib/dbConnect';
import Competition from '../../../lib/models/Competition';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await dbConnect();
    const comp = await Competition.findOne({ slug: req.query.slug }).lean();
    if (!comp) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(comp);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
