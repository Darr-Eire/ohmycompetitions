// src/lib/requireAuth.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

export async function requireAuth(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }
  return session;
}
