import dbConnect from 'lib/dbConnect';
import Thread from '@models/Thread';
import Reply from '@models/Reply';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  await dbConnect();

  const { id } = req.query;

  // ✅ Validate ObjectId to avoid crashing if bad ID is passed
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid thread ID' });
  }

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
