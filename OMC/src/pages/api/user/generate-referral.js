// src/pages/api/user/generate-referral.js

import { connectToDatabase } from 'lib/dbConnect';import User from 'models/User';
import { generateReferralCode } from 'lib/generateReferralCode';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { piUserId } = req.body;

  const user = await User.findOne({ piUserId });
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (!user.referralCode) {
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateReferralCode();
      const exists = await User.findOne({ referralCode: code });
      if (!exists) isUnique = true;
    }
    user.referralCode = code;
    await user.save();
  }

  res.status(200).json({ referralCode: user.referralCode });
}
