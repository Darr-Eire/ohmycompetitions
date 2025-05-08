// pages/api/forums/reply.js
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/dbConnect';
import Reply from '@/models/Reply';
import { authOptions } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await dbConnect();
  const session = await getServerSession(req, res, authOptions);
  const uid = session?.user?.uid;
  if (!uid) return res.status(401).json({ error: 'Unauthorized' });

  const { threadId, body } = req.body;
  if (!threadId || !body) return res.status(400).json({ error: 'Missing fields' });

  const reply = await Reply.create({ threadId, userUid: uid, body });
  return res.status(200).json({ success: true, reply });
}
