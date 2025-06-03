import { connectToDatabase } from 'lib/dbConnect';
import Competition from 'models/Competition';


export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') return res.status(405).end();

  const { title, imageUrl, prize, ipfsHash } = req.body;

  const competition = await Competition.create({ title, imageUrl, prize, ipfsHash });
  res.status(201).json(competition);
}
