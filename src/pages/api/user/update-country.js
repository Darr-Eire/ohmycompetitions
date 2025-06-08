import { dbConnect } from 'lib/dbConnect';
import User from 'models/User';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, country } = req.body;

  if (!email || !country) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await User.findOneAndUpdate({ email }, { country });
    res.status(200).json({ message: 'Country updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}
