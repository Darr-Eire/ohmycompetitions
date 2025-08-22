import { requireAdmin } from '../_adminAuth';
import { dbConnect } from 'lib/dbConnect';

// If you already have a User model with a referralCount field, import it:
// import User from '@/models/User';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  const useMock = process.env.ADMIN_MOCK === '1';

  if (useMock) {
    const mock = [
      { userId: 'u1', username: 'piKing', referrals: 42 },
      { userId: 'u2', username: 'satoshi_pi', referrals: 28 },
      { userId: 'u3', username: 'ohmywinner', referrals: 21 },
      { userId: 'u4', username: 'alphaNode', referrals: 17 },
      { userId: 'u5', username: 'piStorm', referrals: 11 },
    ];
    return res.status(200).json(mock);
  }

  try {
    await dbConnect();
    // Replace with your actual User aggregation/fields
    // Example if you track referrals:
    // const top = await User.find({ referralCount: { $gt: 0 } })
    //   .select('_id username referralCount')
    //   .sort({ referralCount: -1 })
    //   .limit(10)
    //   .lean();
    // const mapped = top.map(u => ({ userId: String(u._id), username: u.username, referrals: u.referralCount }));

    // TEMP placeholder if you don’t have User yet:
    const mapped = [];
    return res.status(200).json(mapped);
  } catch (e) {
    console.error('referrals/top API error', e);
    return res.status(500).json({ message: 'Server error' });
  }
}
