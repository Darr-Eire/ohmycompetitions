import { connectToDatabase } from 'lib/dbConnect';
import Competition from '../../../models/Competition';


export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'GET') return res.status(405).end();

  const comps = await Competition.find({});
  res.status(200).json(comps);
}
