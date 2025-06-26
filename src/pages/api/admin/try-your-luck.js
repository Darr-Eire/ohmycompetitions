import { dbConnect } from 'lib/dbConnect';
import GameResult from 'models/GameResult';
import User from 'models/User';

export default async function handler(req, res) {
  await dbConnect();

  // ✅ TEMPORARILY DISABLED AUTH FOR TESTING
  // const session = await getServerSession(req, res, authOptions);
  // if (!session || session.user?.role !== 'admin') {
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }

  if (req.method === 'GET') {
    try {
      const { action } = req.query;

      if (action === 'stats') {
        // Game statistics
        const stats = await GameResult.aggregate([
          {
            $group: {
              _id: '$game',
              totalPlayed: { $sum: 1 },
              totalPrizes: { $sum: '$prizeAmount' },
              averagePrize: { $avg: '$prizeAmount' }
            }
          }
        ]);

        const userStats = await User.aggregate([
          {
            $project: {
              hasPlayedReflex: { $ne: ['$lastReflexAt', null] },
              hasPlayedSpin: { $ne: ['$lastSpinAt', null] },
              hasPlayedSlot: { $ne: ['$lastSlotAt', null] },
              lastActive: {
                $max: ['$lastReflexAt', '$lastSpinAt', '$lastSlotAt']
              }
            }
          },
          {
            $group: {
              _id: null,
              totalUsers: { $sum: 1 },
              activeReflexPlayers: { $sum: { $cond: ['$hasPlayedReflex', 1, 0] } },
              activeSpinPlayers: { $sum: { $cond: ['$hasPlayedSpin', 1, 0] } },
              activeSlotPlayers: { $sum: { $cond: ['$hasPlayedSlot', 1, 0] } }
            }
          }
        ]);

        return res.status(200).json({
          gameStats: stats,
          userStats: userStats[0] || {
            totalUsers: 0,
            activeReflexPlayers: 0,
            activeSpinPlayers: 0,
            activeSlotPlayers: 0
          }
        });
      }

      if (action === 'recent-results') {
        // Recent game results
        const recentResults = await GameResult.find({})
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();

        return res.status(200).json(recentResults);
      }

      if (action === 'top-winners') {
        // Top winners
        const topWinners = await GameResult.aggregate([
          { $match: { prizeAmount: { $gt: 0 } } },
          {
            $group: {
              _id: '$userUid',
              totalWinnings: { $sum: '$prizeAmount' },
              gamesWon: { $sum: 1 },
              lastWin: { $max: '$createdAt' }
            }
          },
          { $sort: { totalWinnings: -1 } },
          { $limit: 20 }
        ]);

        return res.status(200).json(topWinners);
      }

      // Default: return all games info
      const games = [
        {
          name: 'Match The Pi Code',
          slug: 'match-code',
          description: 'Stop timer at exactly 3.14s',
          prize: '50π base, 100π jackpot'
        },
        {
          name: 'Hack The Vault',
          slug: 'hack-the-vault',
          description: 'Crack the 4-digit code',
          prize: '50π'
        },
        {
          name: 'Spin Wheel',
          slug: 'spin',
          description: 'Daily spin for prizes',
          prize: 'Various tickets and Pi'
        },
        {
          name: 'Slot Machine',
          slug: 'slot',
          description: 'Classic slot machine',
          prize: 'Random rewards'
        }
      ];

      return res.status(200).json({ games });
    } catch (err) {
      console.error('Error loading Try Your Luck data:', err);
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { action, userUid, game, result, prizeAmount } = req.body;

      if (action === 'reset-user') {
        // Reset user's daily game attempts
        if (!userUid) {
          return res.status(400).json({ message: 'Missing userUid' });
        }

        await User.findOneAndUpdate(
          { uid: userUid },
          {
            $unset: {
              lastReflexAt: 1,
              lastSpinAt: 1,
              lastSlotAt: 1
            }
          }
        );

        return res.status(200).json({ message: 'User game attempts reset successfully' });
      }

      if (action === 'manual-result') {
        // Manually add game result
        if (!userUid || !game) {
          return res.status(400).json({ message: 'Missing required fields' });
        }

        const gameResult = await GameResult.create({
          userUid,
          game,
          result: result || 'Manual entry',
          prizeAmount: prizeAmount || 0
        });

        return res.status(201).json({ message: 'Game result added', result: gameResult });
      }

      return res.status(400).json({ message: 'Unknown action' });
    } catch (err) {
      console.error('Error in Try Your Luck admin action:', err);
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { action, id } = req.body;

      if (action === 'delete-result') {
        if (!id) {
          return res.status(400).json({ message: 'Missing result ID' });
        }

        await GameResult.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Game result deleted successfully' });
      }

      if (action === 'clear-all-results') {
        await GameResult.deleteMany({});
        return res.status(200).json({ message: 'All game results cleared' });
      }

      return res.status(400).json({ message: 'Unknown delete action' });
    } catch (err) {
      console.error('Error deleting Try Your Luck data:', err);
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  res.status(405).end();
} 