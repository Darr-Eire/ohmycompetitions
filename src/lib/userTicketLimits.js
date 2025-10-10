// src/lib/userTicketLimits.js
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_DB_URL;

/**
 * Count how many tickets a user has purchased for a specific competition
 * @param {string} userId - User ID (uid, piUserId, or username)
 * @param {string} competitionSlug - Competition slug
 * @returns {Promise<number>} - Number of tickets purchased by user for this competition
 */
export async function getUserTicketCount(userId, competitionSlug) {
  if (!MONGODB_URI) {
    console.warn('No MongoDB URI available for ticket counting');
    return 0;
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();

    // Count tickets from payments collection
    const payments = await db.collection('payments').find({
      status: 'completed',
      competitionSlug: competitionSlug,
      $or: [
        { 'piUser.uid': userId },
        { 'piUser.username': userId },
        { uid: userId },
        { username: userId }
      ]
    }).toArray();

    const ticketCount = payments.reduce((total, payment) => {
      return total + (payment.ticketQuantity || 1);
    }, 0);

    await client.close();
    return ticketCount;
  } catch (error) {
    console.error('Error counting user tickets:', error);
    return 0;
  }
}

/**
 * Get the maximum tickets allowed for a user for a specific competition
 * @param {Object} user - User document
 * @param {Object} competition - Competition document
 * @returns {number} - Maximum tickets allowed
 */
export function getUserTicketLimit(user, competition) {
  // Check if competition has maxPerUser set
  const competitionLimit = competition?.comp?.maxPerUser;
  if (competitionLimit && competitionLimit > 0) {
    return competitionLimit;
  }

  // Check user's per-competition override
  const userOverride = user?.maxTicketsOverrides?.get?.(competition?.comp?.slug);
  if (userOverride && userOverride > 0) {
    return userOverride;
  }

  // Use user's default limit
  const userDefault = user?.maxTicketsDefault;
  if (userDefault && userDefault > 0) {
    return userDefault;
  }

  // Fallback to global default (50)
  return 50;
}

/**
 * Check if user can purchase the requested number of tickets
 * @param {string} userId - User ID
 * @param {string} competitionSlug - Competition slug
 * @param {number} requestedQuantity - Number of tickets user wants to buy
 * @param {Object} user - User document
 * @param {Object} competition - Competition document
 * @returns {Promise<{canPurchase: boolean, currentCount: number, limit: number, remaining: number}>}
 */
export async function canUserPurchaseTickets(userId, competitionSlug, requestedQuantity, user, competition) {
  const currentCount = await getUserTicketCount(userId, competitionSlug);
  const limit = getUserTicketLimit(user, competition);
  const remaining = Math.max(0, limit - currentCount);
  const canPurchase = requestedQuantity <= remaining;

  return {
    canPurchase,
    currentCount,
    limit,
    remaining
  };
}
