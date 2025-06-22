// Utility functions for App-to-User Pi payments

/**
 * Send a payout to a user
 * @param {string} userUid - The user's Pi Network UID
 * @param {number} amount - Amount in Pi to send
 * @param {string} reason - Reason for the payout (e.g., 'prize', 'referral_bonus', 'reward')
 * @param {string} memo - Custom memo for the payment
 * @param {object} metadata - Additional metadata
 * @returns {Promise<object>} Payment result
 */
export async function sendPayout(userUid, amount, reason, memo = null, metadata = {}) {
  try {
    const response = await fetch('/api/pi/send-payout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userUid,
        amount,
        reason,
        memo: memo || `Payout from OhMyCompetitions: ${reason}`,
        metadata: {
          timestamp: Date.now(),
          ...metadata
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send payout');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Failed to send payout:', error);
    throw error;
  }
}

/**
 * Send a competition prize to the winner
 * @param {string} userUid - Winner's Pi Network UID
 * @param {number} amount - Prize amount in Pi
 * @param {string} competitionTitle - Title of the competition
 * @param {string} ticketNumber - Winning ticket number
 * @returns {Promise<object>} Payment result
 */
export async function sendCompetitionPrize(userUid, amount, competitionTitle, ticketNumber) {
  return sendPayout(
    userUid,
    amount,
    'competition_prize',
    `🏆 Congratulations! You won ${competitionTitle} with ticket #${ticketNumber}`,
    {
      type: 'competition_prize',
      competitionTitle,
      ticketNumber
    }
  );
}

/**
 * Send a referral bonus to a user
 * @param {string} userUid - Referrer's Pi Network UID
 * @param {number} amount - Bonus amount in Pi
 * @param {number} referralCount - Number of successful referrals
 * @returns {Promise<object>} Payment result
 */
export async function sendReferralBonus(userUid, amount, referralCount) {
  return sendPayout(
    userUid,
    amount,
    'referral_bonus',
    `💰 Referral bonus for bringing ${referralCount} friend${referralCount > 1 ? 's' : ''} to OhMyCompetitions!`,
    {
      type: 'referral_bonus',
      referralCount
    }
  );
}

/**
 * Send a daily reward to a user
 * @param {string} userUid - User's Pi Network UID
 * @param {number} amount - Reward amount in Pi
 * @param {number} streakDays - Number of consecutive days
 * @returns {Promise<object>} Payment result
 */
export async function sendDailyReward(userUid, amount, streakDays) {
  return sendPayout(
    userUid,
    amount,
    'daily_reward',
    `⭐ Daily reward for ${streakDays} day${streakDays > 1 ? 's' : ''} streak!`,
    {
      type: 'daily_reward',
      streakDays
    }
  );
}

/**
 * Send a special promotion reward
 * @param {string} userUid - User's Pi Network UID
 * @param {number} amount - Reward amount in Pi
 * @param {string} promotionName - Name of the promotion
 * @returns {Promise<object>} Payment result
 */
export async function sendPromotionReward(userUid, amount, promotionName) {
  return sendPayout(
    userUid,
    amount,
    'promotion_reward',
    `🎉 Special reward from ${promotionName} promotion!`,
    {
      type: 'promotion_reward',
      promotionName
    }
  );
}

/**
 * Check the status of a payout
 * @param {string} paymentId - The payment ID to check
 * @returns {Promise<object>} Payment status
 */
export async function checkPayoutStatus(paymentId) {
  try {
    const response = await fetch(`/api/pi/payout-status?paymentId=${paymentId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to check payout status');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Failed to check payout status:', error);
    throw error;
  }
}

/**
 * List payouts with optional filters
 * @param {object} filters - Filter options (status, userUid, limit, skip, etc.)
 * @returns {Promise<object>} List of payouts with pagination
 */
export async function listPayouts(filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `/api/pi/list-payouts${queryParams ? '?' + queryParams : ''}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to list payouts');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Failed to list payouts:', error);
    throw error;
  }
}

/**
 * Get user's payout history
 * @param {string} userUid - User's Pi Network UID
 * @param {number} limit - Number of records to retrieve
 * @returns {Promise<object>} User's payout history
 */
export async function getUserPayoutHistory(userUid, limit = 20) {
  return listPayouts({
    userUid,
    limit: limit.toString(),
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
}

// Common payout amounts for different scenarios
export const PAYOUT_AMOUNTS = {
  // Competition prizes
  SMALL_PRIZE: 1.0,     // 1π for small competitions
  MEDIUM_PRIZE: 5.0,    // 5π for medium competitions
  LARGE_PRIZE: 10.0,    // 10π for large competitions
  MEGA_PRIZE: 50.0,     // 50π for mega competitions

  // Referral bonuses
  REFERRAL_BONUS: 0.1,  // 0.1π per successful referral

  // Daily rewards
  DAILY_REWARD: 0.05,   // 0.05π daily reward
  STREAK_BONUS: 0.1,    // 0.1π bonus for 7+ day streaks

  // Special rewards
  SIGNUP_BONUS: 0.5,    // 0.5π for new user signup
  VERIFICATION_BONUS: 1.0, // 1π for completing verification
};

// Helper function to validate payout amounts
export function validatePayoutAmount(amount) {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Payout amount must be a positive number');
  }
  if (numAmount > 1000) {
    throw new Error('Payout amount cannot exceed 1000π');
  }
  return numAmount;
} 