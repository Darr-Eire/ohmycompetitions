import { dbConnect } from 'lib/dbConnect';
import Vote from 'models/Vote';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userUid } = req.query;

  if (!userUid) {
    return res.status(400).json({ error: 'User UID required' });
  }

  try {
    await dbConnect();

    const vote = await Vote.findOne({ userUid });
    
    if (vote) {
      return res.status(200).json({
        hasVoted: true,
        nomineeName: vote.nomineeName,
        votedAt: vote.createdAt
      });
    }

    return res.status(200).json({
      hasVoted: false
    });
  } catch (err) {
    console.error('Error checking user vote:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 