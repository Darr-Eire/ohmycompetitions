// file: src/pages/api/funnel/[slug].js
import Competition from '../../../lib/models/Competition';
import { dbConnect } from '../../../lib/dbConnect';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { slug } = req.query;
  try {
    await dbConnect();
    // adjust this to your actual model/fields
    const comp = await Competition.findOne({ slug }).lean();
    if (!comp) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(comp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
