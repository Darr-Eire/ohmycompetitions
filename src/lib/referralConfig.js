// src/lib/referralConfig.js
export const REF_CFG = {
  // rewards
  rewardPerReferral: { type: 'ticket', qty: 1 },      // 1 friend = 1 free ticket
  rewardPerReferralXP: 50,                            // +50 XP as well
  milestones: [
    { threshold: 5,  rewards: [{ type:'ticket', qty:3 }] },   // +3 tickets at 5
    { threshold: 10, rewards: [{ type:'xp', qty:100 }, { type:'badge', name:'Top Referrer' }] },
  ],
  // conditions
  requireFirstPaidAction: true,  // only reward when referee makes 1st paid ticket OR paid stage
  weeklyCapTickets: 10,          // max free tickets from referrals per week
  // anti-abuse
  disallowSelfReferral: true,
  blockSameDeviceWithinHours: 72, // same device can’t refer itself in 72h window
  // leaderboard
  leaderboardWeeklyWinners: 10,  // top N get into a special draw
  // link
  baseUrl: 'https://www.ohmycompetitions.com',
};
