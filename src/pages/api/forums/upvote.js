import { dbConnect } from 'lib/dbConnect';

import Thread from 'models/Thread';



export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { threadId } = req.body;

  if (!threadId) {
    return res.status(400).json({ error: 'Missing threadId' });
  }

  try {
    await connectToDatabase();

    const thread = await Thread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const alreadyUpvoted = thread.upvotes.includes(userId);

    if (alreadyUpvoted) {
      thread.upvotes = thread.upvotes.filter((u) => u !== userId);
    } else {
      thread.upvotes.push(userId);
    }

    await thread.save();

    return res.status(200).json({ success: true, upvotes: thread.upvotes.length });
  } catch (err) {
    console.error('[UPVOTE ERROR]', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
