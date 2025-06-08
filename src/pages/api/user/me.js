import { dbConnect } from 'lib/dbConnect';
import User from 'models/User';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { piUserId } = req.body;

  if (!piUserId) {
    return res.status(400).json({ message: 'Missing Pi User ID' });
  }

  try {
    const user = await User.findOne({ piUserId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      username: user.username,
      country: user.country,
      bio: user.bio,
      profileImage: user.profileImage,
      birthdate: user.birthdate,
      social: user.social,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}
