let gameStats = {
  successCount: 0,
  dailyWins: 0,
  lastWinReset: null,
};

export default function handler(req, res) {
  const { successCount } = req.body;

  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  if (gameStats.lastWinReset !== today) {
    gameStats.dailyWins = 0;
    gameStats.lastWinReset = today;
  }

  gameStats.successCount = successCount;

  const isEligible = successCount % 33 === 0;
  const underDailyLimit = gameStats.dailyWins < 3;

  if (isEligible && underDailyLimit) {
    gameStats.dailyWins += 1;
    return res.status(200).json({
      win: true,
      reason: '🎉 You win 31.4π!',
    });
  }

  if (isEligible && !underDailyLimit) {
    return res.status(200).json({
      win: false,
      reason: '✅ Perfect stack, but today’s 3-win limit is reached. Try again tomorrow!',
    });
  }

  return res.status(200).json({
    win: false,
    reason: '',
  });
}
