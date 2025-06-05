import dbConnect from 'lib/dbConnect';
import Competition from 'models/Competition';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const comp = await Competition.create(req.body);
      return res.status(201).json(comp);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
