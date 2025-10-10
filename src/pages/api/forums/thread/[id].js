// src/pages/api/forums/thread/[id].js

import { dbConnect } from '../../../../lib/dbConnect';
import Thread from '../../../../models/Thread';
import Reply from '../../../../models/Reply';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  await dbConnect();

  // ✅ TEMPORARILY DISABLED AUTH FOR LOCAL TESTING
  // const session = await getServerSession(req, res, authOptions);
  // if (!session || session.user?.role !== 'admin') {
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }

  const { id } = req.query;

  // Helper function to check if string is valid ObjectId
  const isValidObjectId = (str) => {
    return mongoose.Types.ObjectId.isValid(str) && str.length === 24;
  };

  if (req.method === 'GET') {
    try {
      let query;
      
      // If it's a valid ObjectId, search by _id, otherwise search by slug
      if (isValidObjectId(id)) {
        query = { _id: id };
      } else {
        query = { slug: id };
      }

      // Find thread and increment view count
      const thread = await Thread.findOneAndUpdate(
        query,
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
      const { body, author, authorUid } = req.body;

      if (!body) {
        return res.status(400).json({ error: 'Reply body is required' });
      }

      let query;
      
      // If it's a valid ObjectId, search by _id, otherwise search by slug
      if (isValidObjectId(id)) {
        query = { _id: id };
      } else {
        query = { slug: id };
      }

      const thread = await Thread.findOne(query);
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
