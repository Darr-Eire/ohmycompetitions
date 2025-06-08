import dbConnect from 'lib/dbConnect';
import User from 'models/User';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { piUserId, country } = req.body;

  if (!piUserId || !country) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await User.findOneAndUpdate({ piUserId }, { country });

    res.status(200).json({ message: 'Country updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}