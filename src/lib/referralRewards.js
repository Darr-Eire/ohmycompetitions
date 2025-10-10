// src/lib/referralRewards.js

/**
 * Lightweight, no-op referral rewards helpers.
 * Replace these with your real logic later (DB writes, ticket awards, etc).
 */

export async function handleReferralJoin({ userId, code, meta } = {}) {
  // TODO: write referral join to DB, award tickets, etc.
  return { ok: true, userId: userId || null, code: code || null, meta: meta || null };
}

export async function recordReferralClick({ code, userAgent, ip, ts } = {}) {
  // TODO: persist click
  return { ok: true, code: code || null, ts: ts || Date.now() };
}

export async function awardSignupBonus({ referrerUserId, referredUserId } = {}) {
  // TODO: grant bonus tickets or XP
  return { ok: true, awarded: 0 };
}

export async function awardReferralTickets({ referrerUserId, count = 1 } = {}) {
  // TODO: increment ticket balance
  return { ok: true, awarded: count };
}

export async function computeReferralStats({ userId } = {}) {
  // TODO: aggregate from DB
  return {
    ok: true,
    userId: userId || null,
    signupCount: 0,
    ticketsEarned: 0,
    miniGamesBonus: 0,
    totalBonusTickets: 0,
    competitionBreakdown: {},
  };
}

export default {
  handleReferralJoin,
  recordReferralClick,
  awardSignupBonus,
  awardReferralTickets,
  computeReferralStats,
};
