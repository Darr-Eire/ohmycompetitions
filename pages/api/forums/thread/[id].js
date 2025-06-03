// pages/api/forums/thread/[id].js
import dbConnect from 'lib/dbConnect';
import Thread from '@models/Thread'

;
import Reply from '@models/Reply;

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (req.method !== 'GET') return res.status(405).end();

  try {
    const thread = await Thread.findById(id).lean();
    if (!thread) return res.status(404).json({ error: 'Thread not found' });

    const replies = await Reply.find({ threadId: id }).sort({ createdAt: -1 }).lean();

    res.status(200).json({ thread, replies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch thread' });
  }
}
