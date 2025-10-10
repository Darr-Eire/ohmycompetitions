import crypto from 'crypto';

export function generateEntryHash(competitionId, userId, timestamp) {
  return crypto.createHash('sha256').update(`${competitionId}-${userId}-${timestamp}`).digest('hex');
}
