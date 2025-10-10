// src/pages/api/user/apply-referral.js

import { connectToDatabase } from 'lib/dbConnect';import User from 'models/User';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { piUserId, referralCode } = req.body;

  if (!piUserId || !referralCode) {
    return res.status(400).json({ message: 'Missing params' });
  }

  const user = await User.findOne({ piUserId });
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.referredBy) return res.status(400).json({ message: 'Referral already applied' });

  const referrer = await User.findOne({ referralCode });
  if (!referrer) return res.status(404).json({ message: 'Invalid referral code' });

  user.referredBy = referralCode;
  user.bonusTickets += 5;
  referrer.bonusTickets += 5;
  referrer.referralWeeklyCount += 1;
  referrer.referralCount += 1;

  await user.save();
  await referrer.save();

  res.status(200).json({ message: 'Referral applied successfully' });
}
