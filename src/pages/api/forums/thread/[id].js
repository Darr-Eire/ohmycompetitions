// src/pages/api/admin/forums/[id].js

import { dbConnect } from 'lib/dbConnect';
import Thread from 'models/Thread';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from 'lib/auth';

export default async function handler(req, res) {
  await dbConnect();

  // ✅ TEMPORARILY DISABLED AUTH FOR LOCAL TESTING
  // const session = await getServerSession(req, res, authOptions);
  // if (!session || session.user?.role !== 'admin') {
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }

  const {
    query: { id },
    method,
  } = req;

  if (!id || id.length !== 24) {
    return res.status(400).json({ message: 'Invalid thread ID' });
  }

  try {
    switch (method) {
      case 'DELETE':
        await Thread.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Thread deleted successfully' });

      case 'PUT':
        const { title, body, category } = req.body;
        const updated = await Thread.findByIdAndUpdate(
          id,
          { title, body, category },
          { new: true }
        );
        return res.status(200).json(updated);

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error(`[ERROR] /api/admin/forums/${id}:`, error);
    return res.status(500).json({ message: 'Server error' });
  }
}
