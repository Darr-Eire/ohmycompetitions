import dbConnect from 'lib/dbConnect';
import User from 'models/User';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  await dbConnect();

  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await User.findById(session.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json({
    name: user.name,
    email: user.email,
    country: user.country || '',
  });
}
