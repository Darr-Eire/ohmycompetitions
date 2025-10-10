import { requireAdmin } from '../_adminAuth';
import { dbConnect } from 'lib/dbConnect';
import User from 'models/User';
import { sendPayout } from 'lib/piPayouts';
import Notification from 'models/Notification';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await dbConnect();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get top referrers from past week
    const topReferrers = await User.aggregate([
      { $match: { referralWeeklyCount: { $gt: 0 } } },
      { $sort: { referralWeeklyCount: -1 } },
      { $limit: 10 },
      { $project: { username: 1, referralWeeklyCount: 1, piUserId: 1, uid: 1 } }
    ]);

    const rewards = [];
    const piRewards = [
      { rank: 1, amount: 5.0, name: 'Top Referrer' },
      { rank: 2, amount: 3.0, name: 'Second Place' },
      { rank: 3, amount: 2.0, name: 'Third Place' },
      { rank: 4, amount: 1.0, name: 'Fourth Place' },
      { rank: 5, amount: 1.0, name: 'Fifth Place' },
    ];

    for (let i = 0; i < Math.min(topReferrers.length, 5); i++) {
      const user = topReferrers[i];
      const reward = piRewards[i];
      
      if (!user.uid && !user.piUserId) continue;

      try {
        const payoutResult = await sendPayout(
          user.uid || user.piUserId,
          reward.amount,
          'weekly_referral_reward',
          `🏆 Weekly Referral Reward: ${reward.name} - ${user.referralWeeklyCount} referrals`,
          {
            type: 'weekly_referral_reward',
            rank: reward.rank,
            referralCount: user.referralWeeklyCount,
            weekEnd: now.toISOString().split('T')[0]
          }
        );

        // Create notification
        await Notification.create({
          userId: user.uid || user.piUserId,
          username: user.username,
          type: 'win',
          title: `Weekly Referral Reward: ${reward.name}`,
          message: `You earned ${reward.amount}π for ${user.referralWeeklyCount} referrals this week!`,
          href: '/referrals/leaderboard'
        });

        rewards.push({
          username: user.username,
          rank: reward.rank,
          amount: reward.amount,
          referrals: user.referralWeeklyCount,
          paymentId: payoutResult.paymentId
        });

      } catch (error) {
        console.error(`Failed to reward ${user.username}:`, error);
        rewards.push({
          username: user.username,
          rank: reward.rank,
          amount: reward.amount,
          referrals: user.referralWeeklyCount,
          error: error.message
        });
      }
    }

    // Reset all weekly counts
    await User.updateMany(
      { referralWeeklyCount: { $gt: 0 } },
      { $set: { referralWeeklyCount: 0 } }
    );

    res.status(200).json({
      ok: true,
      message: `Processed ${rewards.length} weekly referral rewards`,
      rewards,
      resetCount: await User.countDocuments({ referralWeeklyCount: 0 })
    });

  } catch (error) {
    console.error('Weekly referral rewards error:', error);
    res.status(500).json({ error: 'Failed to process weekly rewards' });
  }
}
