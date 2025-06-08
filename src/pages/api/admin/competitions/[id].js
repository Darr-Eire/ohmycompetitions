import { connectToDatabase } from '@lib/dbConnect';
import Competition from '@models/Competition';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@lib/auth';


export default async function handler(req, res) {
  await connectToDatabase();
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user?.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const competition = await Competition.findById(id);
        if (!competition) return res.status(404).json({ error: 'Not found' });
        res.json(competition);
      } catch (err) {
        res.status(500).json({ error: 'Failed to fetch' });
      }
      break;

    case 'PUT':
      try {
        const updated = await Competition.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updated);
      } catch (err) {
        res.status(500).json({ error: 'Failed to update' });
      }
      break;

    case 'DELETE':
      try {
        await Competition.findByIdAndDelete(id);
        res.json({ message: 'Deleted successfully' });
      } catch (err) {
        res.status(500).json({ error: 'Failed to delete' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
