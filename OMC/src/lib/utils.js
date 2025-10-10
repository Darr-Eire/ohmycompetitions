function generateRandomCode() {
  return (
    Math.random().toString(36).substring(2, 6).toUpperCase() +
    '-' +
    Math.random().toString(36).substring(2, 6).toUpperCase()
  );
}

function getPiCashTimes() {
  const now = new Date();

  // Set to next Monday at 15:14 UTC
  const monday = new Date(now);
  const currentDay = now.getUTCDay();
  const daysUntilMonday = (1 + 7 - currentDay) % 7 || 7;
  monday.setUTCDate(now.getUTCDate() + daysUntilMonday);
  monday.setUTCHours(15, 14, 0, 0);

  // Code expires 31h 4m later
  const expiresAt = new Date(monday.getTime() + (31 * 60 + 4) * 60 * 1000);

  // Draw happens Friday at 15:14 UTC
  const drawAt = new Date(monday);
  drawAt.setUTCDate(monday.getUTCDate() + 4);
  drawAt.setUTCHours(15, 14, 0, 0);

  // Claim window lasts 31m 4s after draw
  const claimExpiresAt = new Date(drawAt.getTime() + (31 * 60 + 4) * 1000);

  return {
    code: generateRandomCode(),
    weekStart: monday,
    expiresAt,
    drawAt,
    claimExpiresAt,
    prizePool: 10000,
    claimed: false,
    winner: null,
    rolloverFrom: null
  };
}

module.exports = {
  getPiCashTimes
};
