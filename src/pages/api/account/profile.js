// src/pages/api/account/profile.js

import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { dbConnect } from 'lib/dbConnect';
import User from 'models/User';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();
  const email = session.user.email;

  if (req.method === 'GET') {
    try {
      let user = await User.findOne({ email });

      // Auto-create profile if not exists
      if (!user) {
        user = await User.create({ email });
      }

      const profile = {
        name: user.name || '',
        country: user.country || '',
        flag: user.flag || '',
        profileImage: user.profileImage || '',
        bio: user.bio || '',
        birthdate: user.birthdate || '',
        social: user.social || {},
      };

      return res.status(200).json(profile);
    } catch (err) {
      return res.status(500).json({ message: 'Failed to load profile' });
    }
  }

  if (req.method === 'POST') {
    try {
      const data = req.body;

      const updated = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            name: data.name || '',
            country: data.country || '',
            flag: data.flag || '',
            profileImage: data.profileImage || '',
            bio: data.bio || '',
            birthdate: data.birthdate || '',
            social: data.social || {},
          },
        },
        { new: true, upsert: true }
      );

      return res.status(200).json({ message: 'Profile updated', user: updated });
    } catch (err) {
      return res.status(500).json({ message: 'Failed to save profile' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
