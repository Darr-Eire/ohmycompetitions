import { getServerSession } from 'next-auth/next';
import dbConnect from 'lib/dbConnect';
import Reply from 'models/Reply';
import { authOptions } from 'lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { threadId, body } = req.body;

  if (!threadId || !body) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  if (body.length > 1000) {
    return res.status(400).json({ error: 'Reply too long' });
  }

  try {
    await dbConnect();
    const reply = await Reply.create({ threadId, userId, body });
    return res.status(200).json({ success: true, reply });
  } catch (err) {
    console.error('[REPLY CREATE ERROR]', err);
    return res.status(500).json({ error: 'Failed to create reply' });
  }
}
