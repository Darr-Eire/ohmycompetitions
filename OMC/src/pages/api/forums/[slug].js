import { dbConnect } from '../../../lib/dbConnect';
import Thread from '../../../models/Thread';
import Reply from '../../../models/Reply';

export default async function handler(req, res) {
  const { slug } = req.query;

  if (req.method === 'GET') {
    try {
      await dbConnect();

      // Find thread and increment view count
      const thread = await Thread.findOneAndUpdate(
        { slug },
        { $inc: { views: 1 } },
        { new: true }
      ).lean();

      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      // Get replies for this thread
      const replies = await Reply.find({ threadId: thread._id })
        .sort({ createdAt: 1 })
        .lean();

      res.status(200).json({ thread, replies });
    } catch (error) {
      console.error('Error fetching thread:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    // Add reply to thread
    try {
      await dbConnect();

      const { body, author, authorUid } = req.body;

      if (!body) {
        return res.status(400).json({ error: 'Reply body is required' });
      }

      const thread = await Thread.findOne({ slug });
      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      if (thread.isLocked) {
        return res.status(403).json({ error: 'Thread is locked' });
      }

      const reply = await Reply.create({
        threadId: thread._id,
        body,
        author: author || 'Anonymous',
        authorUid
      });

      // Update thread stats
      await Thread.findByIdAndUpdate(thread._id, {
        $inc: { replyCount: 1 },
        lastActivity: new Date()
      });

      res.status(201).json({ message: 'Reply added', reply });
    } catch (error) {
      console.error('Error adding reply:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end();
  }
} 