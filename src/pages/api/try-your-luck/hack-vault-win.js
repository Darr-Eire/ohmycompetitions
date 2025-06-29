import { dbConnect } from '../../../lib/dbConnect';
import { sendPayout } from '../../../lib/piPayouts';
import GameResult from '../../../models/GameResult';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  const { userUid, username, prizeAmount = 50 } = req.body;

  if (!userUid) {
    return res.status(400).json({ error: 'Missing userUid' });
  }

  try {
    console.log('🔓 Hack the Vault win reported:', { userUid, username, prizeAmount });

    // Find the user
    const user = await User.findOne({ 
      $or: [{ uid: userUid }, { piUserId: userUid }, { username: username }] 
    });

    if (!user) {
      console.error('❌ User not found for Hack the Vault win:', { userUid, username });
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already won today
    const today = new Date().toISOString().slice(0, 10);
    const existingWin = await GameResult.findOne({
      userUid: user.uid || userUid,
      game: 'hack_vault',
      createdAt: {
        $gte: new Date(today),
        $lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingWin && existingWin.prizeAmount > 0) {
      return res.status(400).json({ 
        error: 'You already won Hack the Vault today! Come back tomorrow.' 
      });
    }

    // Record the win in GameResult
    const gameResult = await GameResult.create({
      userUid: user.uid || userUid,
      game: 'hack_vault',
      result: `Won ${prizeAmount}π by cracking the vault!`,
      prizeAmount: prizeAmount,
      metadata: {
        game: 'hack_vault',
        winDate: new Date(),
        username: user.username || username
      }
    });

    console.log('📝 Game result saved:', gameResult._id);

    // Send Pi payout
    try {
      const payoutResult = await sendPayout(
        user.uid || userUid,
        prizeAmount,
        'hack_vault_win',
        `🔓 Congratulations! You cracked the vault and won ${prizeAmount}π!`,
        {
          type: 'hack_vault_win',
          gameResultId: gameResult._id,
          game: 'hack_vault',
          winDate: new Date()
        }
      );

      console.log('💰 Hack the Vault payout sent:', {
        userUid: user.uid || userUid,
        username: user.username || username,
        amount: prizeAmount,
        paymentId: payoutResult.paymentId
      });

      return res.status(200).json({
        success: true,
        message: `Congratulations! You won ${prizeAmount}π! Pi has been sent to your wallet.`,
        prizeAmount,
        paymentId: payoutResult.paymentId,
        gameResultId: gameResult._id
      });

    } catch (payoutError) {
      console.error('❌ Pi payout failed for Hack the Vault:', payoutError);
      
      return res.status(200).json({
        success: true,
        message: `You won ${prizeAmount}π! Payout is being processed - check your wallet in a few minutes.`,
        prizeAmount,
        gameResultId: gameResult._id,
        note: 'Payout may be delayed - contact support if not received within 24 hours.'
      });
    }

  } catch (error) {
    console.error('❌ Hack the Vault win processing error:', error);
    return res.status(500).json({
      error: 'Failed to process win. Please try again or contact support.',
      details: error.message
    });
  }
} 