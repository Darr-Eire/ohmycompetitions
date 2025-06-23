import dbConnect from 'lib/dbConnect';
import Referral from 'models/Referral';

export default async function handler(req, res) {
  const { user } = req.query;
  if (!user) return res.status(400).json([]);

  await dbConnect();

  const entries = await Referral.find({ referrer: user });

  const grouped = entries.reduce((acc, cur) => {
    acc[cur.compSlug] = (acc[cur.compSlug] || 0) + 1;
    return acc;
  }, {});

  const formatted = Object.entries(grouped).map(([compSlug, referrals]) => ({
    compSlug,
    referrals,
  }));

  res.json(formatted);
}
