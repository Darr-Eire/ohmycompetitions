import { dbConnect } from '../../../lib/dbConnect';
import { sendPayout } from '../../../lib/piPayouts';
import GameResult from '../../../models/GameResult';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  const { userUid, username, prizeAmount = 50, isJackpot = false, perfectTiming = false } = req.body;

  if (!userUid) {
    return res.status(400).json({ error: 'Missing userUid' });
  }

  try {
    console.log('🕒 Match Pi Code win reported:', { userUid, username, prizeAmount, isJackpot, perfectTiming });

    // Find the user
    const user = await User.findOne({ 
      $or: [{ uid: userUid }, { piUserId: userUid }, { username: username }] 
    });

    if (!user) {
      console.error('❌ User not found for Match Pi Code win:', { userUid, username });
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already won today
    const today = new Date().toISOString().slice(0, 10);
    const existingWin = await GameResult.findOne({
      userUid: user.uid || userUid,
      game: 'match_pi',
      createdAt: {
        $gte: new Date(today),
        $lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingWin && existingWin.prizeAmount > 0) {
      return res.status(400).json({ 
        error: 'You already won Match Pi Code today! Come back tomorrow.' 
      });
    }

    // Calculate final prize amount
    let finalPrize = prizeAmount;
    if (perfectTiming) {
      finalPrize += 2; // Perfect timing bonus
    }

    // Build result message
    let resultMessage = `Matched π sequence! Won ${finalPrize}π`;
    if (isJackpot) {
      resultMessage += ' (JACKPOT!)';
    }
    if (perfectTiming) {
      resultMessage += ' with perfect timing bonus!';
    }

    // Record the win in GameResult
    const gameResult = await GameResult.create({
      userUid: user.uid || userUid,
      game: 'match_pi',
      result: resultMessage,
      prizeAmount: finalPrize,
      metadata: {
        game: 'match_pi',
        isJackpot,
        perfectTiming,
        basePrize: prizeAmount,
        finalPrize,
        winDate: new Date(),
        username: user.username || username
      }
    });

    console.log('📝 Game result saved:', gameResult._id);

    // Send Pi payout
    try {
      const payoutResult = await sendPayout(
        user.uid || userUid,
        finalPrize,
        'match_pi_win',
        `🕒 Congratulations! You matched π and won ${finalPrize}π!${isJackpot ? ' JACKPOT!' : ''}${perfectTiming ? ' Perfect timing!' : ''}`,
        {
          type: 'match_pi_win',
          gameResultId: gameResult._id,
          game: 'match_pi',
          isJackpot,
          perfectTiming,
          basePrize: prizeAmount,
          finalPrize,
          winDate: new Date()
        }
      );

      console.log('💰 Match Pi Code payout sent:', {
        userUid: user.uid || userUid,
        username: user.username || username,
        amount: finalPrize,
        paymentId: payoutResult.paymentId,
        isJackpot,
        perfectTiming
      });

      // Update user's game stats
      await User.findByIdAndUpdate(user._id, {
        $inc: { 
          'gameStats.matchPiWins': 1,
          'gameStats.totalPiWon': finalPrize,
          ...(isJackpot && { 'gameStats.jackpotWins': 1 })
        },
        $set: {
          'gameStats.lastMatchPiWin': new Date()
        }
      }, { upsert: true });

      return res.status(200).json({
        success: true,
        message: `Congratulations! You won ${finalPrize}π! Pi has been sent to your wallet.`,
        prizeAmount: finalPrize,
        basePrize: prizeAmount,
        isJackpot,
        perfectTiming,
        paymentId: payoutResult.paymentId,
        gameResultId: gameResult._id
      });

    } catch (payoutError) {
      console.error('❌ Pi payout failed for Match Pi Code:', payoutError);
      
      // Still record the win, but note the payout error
      await GameResult.findByIdAndUpdate(gameResult._id, {
        $set: { 
          payoutError: payoutError.message,
          payoutFailed: true
        }
      });

      return res.status(200).json({
        success: true,
        message: `You won ${finalPrize}π! Payout is being processed - check your wallet in a few minutes.`,
        prizeAmount: finalPrize,
        basePrize: prizeAmount,
        isJackpot,
        perfectTiming,
        gameResultId: gameResult._id,
        note: 'Payout may be delayed - contact support if not received within 24 hours.'
      });
    }

  } catch (error) {
    console.error('❌ Match Pi Code win processing error:', error);
    return res.status(500).json({
      error: 'Failed to process win. Please try again or contact support.',
      details: error.message
    });
  }
} 