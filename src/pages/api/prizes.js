import dbConnect from 'lib/dbConnect';
import Prize from 'models/Prize';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const prizes = await Prize.find({});
    res.status(200).json(prizes);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
