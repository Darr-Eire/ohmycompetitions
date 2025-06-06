import dbConnect from '../../../lib/dbConnect';
import Battle from '../../../models/Battle';

export default async function handler(req, res) {
  await dbConnect();
  const battles = await Battle.find({ status: 'open' }).sort({ createdAt: -1 });
  res.status(200).json(battles);
}
