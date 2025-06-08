import dbConnect from 'lib/dbConnect';
import User from 'models/User';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  await dbConnect();

  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { country } = req.body;

  await User.findByIdAndUpdate(session.user.id, { country });

  res.status(200).json({ message: 'Country updated successfully' });
}
