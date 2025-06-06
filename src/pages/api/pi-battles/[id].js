import dbConnect from '../../../lib/dbConnect';
import Battle from '../../../models/Battle';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid battle ID' });
  }

  const battle = await Battle.findById(id);

  if (!battle) {
    return res.status(404).json({ error: 'Battle not found' });
  }

  res.status(200).json(battle);
}
