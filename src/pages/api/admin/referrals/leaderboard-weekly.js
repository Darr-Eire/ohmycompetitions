// src/pages/api/admin/referrals/leaderboard-weekly.js
import ReferralEvent from 'models/ReferralEvent';
import User from 'models/User';

export default async function handler(req,res){
  const since = new Date(Date.now() - 7*24*3600*1000);
  const top = await ReferralEvent.aggregate([
    { $match: { type:'QUALIFIED', at: { $gte: since } } },
    { $group: { _id: '$referrerId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 50 }
  ]);
  const withUsers = await User.populate(top, { path: '_id', select: 'username referralCode' });
  res.json({ since, top: withUsers.map(r => ({ userId: r._id._id, username: r._id.username, code: r._id.referralCode, count: r.count })) });
}
