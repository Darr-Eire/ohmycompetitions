import { connectToDatabase } from 'lib/dbConnect';import User from 'models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';

export default async function handler(req, res) {
  await dbConnect();
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user?.role !== 'admin') return res.status(401).json({ message: 'Unauthorized' });

  if (req.method === 'GET') {
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json(users);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    await User.findByIdAndDelete(id);
    return res.status(200).json({ message: 'User deleted' });
  }

  res.setHeader('Allow', ['GET', 'DELETE']);
  res.status(405).end();
}
