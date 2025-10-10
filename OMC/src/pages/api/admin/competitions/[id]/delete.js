import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../../../lib/mongodb';

// Simple admin authentication helper
function verifyAdminSession(req) {
  try {
    const adminSessionCookie = req.headers.cookie
      ?.split('; ')
      .find(row => row.startsWith('admin-session='))
      ?.split('=')[1];

    if (!adminSessionCookie) {
      return false;
    }

    const session = JSON.parse(decodeURIComponent(adminSessionCookie));
    return session && session.role === 'admin' && session.isAdmin;
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return false;
  }
}

export default async function handler(req, res) {
  // Check admin authentication
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { id } = req.query;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    const { db } = await connectToDatabase();

    const result = await db
      .collection('competitions')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    console.log('✅ Competition deleted:', { id });
    return res.status(200).json({ message: 'Competition deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting competition:', {
      error: err.message,
      stack: err.stack,
      id
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 