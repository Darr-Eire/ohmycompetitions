import { dbConnect } from 'lib/dbConnect';
import User from 'models/User';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: 'Username parameter required' });
  }

  try {
    // Find user by username (case insensitive)
    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    }).select('username piUserId uid email').lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user info needed for gifting
    return res.status(200).json({
      username: user.username,
      uid: user.piUserId || user.uid,
      found: true
    });

  } catch (error) {
    console.error('Error looking up user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
} 