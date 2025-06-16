import { dbConnect } from 'lib/dbConnect';
import Battle from 'models/Battle';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { type, prize } = req.query;

    let query = {};
    if (type) query.type = type;
    if (prize) query.prize = Number(prize);

    const battles = await Battle.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, battles });
  } catch (error) {
    console.error('Get Battles Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
