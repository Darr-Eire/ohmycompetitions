// src/pages/api/admin/delete-competition.js
export const runtime = 'nodejs';

import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db.js'; // ✅ use unified connector path

// Simple admin authentication helper
function verifyAdminSession(req) {
  try {
    const adminSessionCookie = req.headers.cookie
      ?.split('; ')
      .find((row) => row.startsWith('admin-session='))
      ?.split('=')[1];

    if (!adminSessionCookie) return false;

    const session = JSON.parse(decodeURIComponent(adminSessionCookie));
    return session && session.role === 'admin' && session.isAdmin;
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return false;
  }
}

export default async function handler(req, res) {
  // Require valid admin session
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Allow DELETE only
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { id } = req.query;

  // Validate ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    const db = await getDb(); // ✅ unified connector

    const result = await db
      .collection('competitions')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    console.log('✅ Competition deleted:', { id });
    return res
      .status(200)
      .json({ message: 'Competition deleted successfully', deletedId: id });
  } catch (err) {
    console.error('❌ Error deleting competition:', {
      error: err.message,
      stack: err.stack,
      id,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
