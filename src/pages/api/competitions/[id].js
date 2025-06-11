import { ObjectId } from 'mongodb';
import { connectToDatabase } from 'lib/mongodb';



export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    const { db } = await connectToDatabase();  // cleaner db connect

    if (req.method === 'DELETE') {
      const result = await db
        .collection('competitions')
        .deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.status(200).json({ message: 'Deleted' });
    }

    res.setHeader('Allow', ['DELETE']);
    return res
      .status(405)
      .json({ error: `Method ${req.method} Not Allowed` });
  } catch (err) {
    console.error(`❌ DELETE /api/competitions/${id} error:`, err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
