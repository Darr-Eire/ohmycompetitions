// pages/api/user/entries.js

import { dbConnect } from 'lib/dbConnect'
import Entry from 'models/Entry'
import User from 'models/User'

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: 'Missing username parameter' });
  }

  try {
    // Find the user first to get their UID
    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle both piUserId and uid field names for backward compatibility
    const userPiId = user.piUserId || user.uid;

    // Find user's entries using both username and UID
    const entries = await Entry.find({ 
      $or: [
        { userUid: username },
        { userUid: userPiId },
        { username: username }
      ]
    })
      .sort({ createdAt: -1 })
      .select('competitionName competitionId quantity status createdAt ticketNumbers')
      .lean();

    console.log(`✅ Found ${entries.length} entries for user ${username}`);

    return res.status(200).json(entries);
  } catch (error) {
    console.error('Error fetching user entries:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
