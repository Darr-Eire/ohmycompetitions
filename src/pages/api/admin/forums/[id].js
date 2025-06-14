import { connectToDatabase } from 'lib/dbConnect';import Thread from 'models/Thread';
import mongoose from 'mongoose';



export default async function handler(req, res) {
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user?.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid thread ID' });
  }

  if (req.method === 'PUT') {
    try {
      await Thread.findByIdAndUpdate(id, req.body);
      return res.status(200).json({ message: 'Updated successfully' });
    } catch (err) {
      console.error('Error updating thread:', err);
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await Thread.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
      console.error('Error deleting thread:', err);
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end();
}
