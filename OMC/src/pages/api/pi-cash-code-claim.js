// pages/api/pi-cash-code-claim.js

import { dbConnect } from '../../lib/dbConnect';
import PiCashCode from '../../models/PiCashCode';
import User from '../../models/User';
import { sendPayout } from '../../lib/piPayouts';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await dbConnect();

    const { submittedCode, uid, username } = req.body;

    if (!submittedCode || !uid || !username) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: submittedCode, uid, username' 
      });
    }

    // Find the current active Pi Cash Code
    const activeCode = await PiCashCode.findOne({
      'winner.uid': uid,
      claimed: false,
      'winner.claimExpiresAt': { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!activeCode) {
      return res.status(404).json({
        success: false,
        message: 'No active claim found for your account or claim window expired'
      });
    }

    // Log the claim attempt
    activeCode.claimAttempts.push({
      uid,
      username,
      submittedCode,
      timestamp: new Date(),
      success: false // Will be updated if successful
    });

    // Check if the submitted code matches
    if (submittedCode.trim().toUpperCase() !== activeCode.code.toUpperCase()) {
      await activeCode.save();
      return res.status(400).json({
        success: false,
        message: 'Incorrect code. Please check the Pi Cash Code page for the correct code.'
      });
    }

    // Check if claim window is still valid
    const now = new Date();
    const claimExpiry = new Date(activeCode.winner.claimExpiresAt);
    
    if (now > claimExpiry) {
      await activeCode.save();
      return res.status(400).json({
        success: false,
        message: 'Claim window has expired. The prize will roll over to next week.'
      });
    }

    // Code is correct and within time limit - process the claim
    try {
      // Send Pi payout to the winner
      const payoutResult = await sendPayout(
        uid,
        activeCode.prizePool,
        'pi_cash_code_prize',
        `🎉 Pi Cash Code Prize: ${activeCode.prizePool} π`,
        {
          type: 'pi_cash_code_prize',
          weekStart: activeCode.weekStart,
          code: activeCode.code,
          claimedAt: new Date()
        }
      );

      console.log('💰 Pi Cash Code payout initiated:', {
        uid,
        username,
        amount: activeCode.prizePool,
        paymentId: payoutResult.paymentId
      });

      // Mark as claimed and update the last attempt as successful
      activeCode.claimed = true;
      activeCode.winner.claimedAt = new Date();
      if (activeCode.claimAttempts.length > 0) {
        activeCode.claimAttempts[activeCode.claimAttempts.length - 1].success = true;
      }

      await activeCode.save();

      // Update user's win history
      await User.findOneAndUpdate(
        { uid },
        {
          $push: {
            'piCashCodeWins': {
              weekStart: activeCode.weekStart,
              prizeAmount: activeCode.prizePool,
              claimedAt: new Date(),
              paymentId: payoutResult.paymentId
            }
          },
          $inc: { 'totalPiCashCodeWins': 1 }
        },
        { upsert: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Prize claimed successfully! Pi will be sent to your wallet.',
        prizeAmount: activeCode.prizePool,
        paymentId: payoutResult.paymentId
      });

    } catch (payoutError) {
      console.error('❌ Pi payout error:', payoutError);
      
      // Still mark as claimed to prevent double claims, but note the payout error
      activeCode.claimed = true;
      activeCode.winner.claimedAt = new Date();
      activeCode.payoutError = payoutError.message;
      if (activeCode.claimAttempts.length > 0) {
        activeCode.claimAttempts[activeCode.claimAttempts.length - 1].success = true;
      }
      await activeCode.save();

      return res.status(200).json({
        success: true,
        message: 'Prize claimed! Pi payout is being processed.',
        prizeAmount: activeCode.prizePool,
        note: 'Payout may be delayed - please contact support if not received within 24 hours.'
      });
    }

  } catch (error) {
    console.error('❌ Pi Cash Code claim error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing claim. Please try again.'
    });
  }
}
