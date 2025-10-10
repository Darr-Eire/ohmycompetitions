import { dbConnect } from 'lib/dbConnect';
import User from 'models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ 
      error: 'userId parameter required',
      referralCode: null
    });
  }

  try {
    await dbConnect();

    // Find user by userId (could be uid or piUserId)
    const user = await User.findOne({
      $or: [
        { uid: userId },
        { piUserId: userId }
      ]
    }).lean();

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        referralCode: null
      });
    }

    // Return the user's referral code
    res.status(200).json({
      referralCode: user.referralCode || user.username,
      username: user.username,
      success: true
    });

  } catch (error) {
    console.error('Error fetching user referral code:', error);
    res.status(500).json({ 
      error: 'Failed to fetch referral code',
      referralCode: null
    });
  }
}
