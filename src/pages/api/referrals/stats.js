import { dbConnect } from 'lib/dbConnect';
import Referral from 'models/Referral';
import User from 'models/User';
import Entry from 'models/Entry';

export default async function handler(req, res) {
  const { user } = req.query;
  
  if (!user) {
    return res.status(400).json({ 
      signupCount: 0, 
      ticketsEarned: 0, 
      miniGamesBonus: 0,
      error: 'Username parameter required' 
    });
  }

  try {
    await dbConnect();

    // Find the user's referral data
    const userDoc = await User.findOne({ username: user }).lean();
    const userReferralCode = userDoc?.referralCode || user;

    // Count successful referrals (people who signed up using this user's referral code)
    const signupCount = await User.countDocuments({ 
      referredBy: userReferralCode 
    });

    // Find referral entries for competitions
    const referralEntries = await Referral.find({ 
      referrer: user 
    }).lean();

    // Also check for entries that were earned through referrals
    const referralBonusEntries = await Entry.find({
      username: user,
      earned: true,
      source: 'referral'
    }).lean();

    // Calculate tickets earned through referrals
    let ticketsEarned = referralEntries.reduce((total, entry) => {
      return total + (entry.referrals || 0);
    }, 0);

    // Add bonus entries
    ticketsEarned += referralBonusEntries.length;

    // Calculate mini games bonus (could be based on referral milestones)
    const miniGamesBonus = Math.floor(signupCount / 3); // 1 bonus for every 3 referrals

    // Group referrals by competition for detailed breakdown
    const competitionBreakdown = referralEntries.reduce((acc, entry) => {
      const compName = entry.compSlug || 'Unknown Competition';
      if (!acc[compName]) {
        acc[compName] = 0;
      }
      acc[compName] += entry.referrals || 0;
      return acc;
    }, {});

    // Add referral bonus entries to breakdown
    referralBonusEntries.forEach(entry => {
      const compName = entry.competitionName || 'Unknown Competition';
      if (!competitionBreakdown[compName]) {
        competitionBreakdown[compName] = 0;
      }
      competitionBreakdown[compName] += 1;
    });

    // Calculate total bonus tickets from user's account
    const totalBonusTickets = (userDoc?.bonusTickets || 0) + ticketsEarned;

    // Calculate next milestone and progress
    const nextMilestone = Math.ceil((signupCount + 1) / 5) * 5;
    const progressToNextMilestone = ((signupCount % 5) / 5) * 100;

    res.status(200).json({
      signupCount,
      ticketsEarned,
      miniGamesBonus,
      userReferralCode,
      competitionBreakdown,
      totalBonusTickets,
      nextMilestone,
      progressToNextMilestone,
      referralUrl: `https://ohmycompetitions.com/signup?ref=${userReferralCode}`,
      success: true
    });

  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({ 
      signupCount: 0, 
      ticketsEarned: 0, 
      miniGamesBonus: 0,
      error: 'Failed to fetch referral statistics' 
    });
  }
}
