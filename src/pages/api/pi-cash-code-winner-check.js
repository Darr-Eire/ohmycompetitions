import { dbConnect } from 'lib/dbConnect';
import PiCashCode from 'models/PiCashCode';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await dbConnect();

    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ 
        success: false, 
        message: 'User UID is required' 
      });
    }

    // Check if user is a winner with an active claim window
    const winnerRecord = await PiCashCode.findOne({
      'winner.uid': uid,
      claimed: false,
      'winner.claimExpiresAt': { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!winnerRecord) {
      return res.status(200).json({
        success: true,
        isWinner: false,
        message: 'No active claims found'
      });
    }

    // User is a winner with active claim window
    return res.status(200).json({
      success: true,
      isWinner: true,
      winner: {
        uid: winnerRecord.winner.uid,
        username: winnerRecord.winner.username,
        selectedAt: winnerRecord.winner.selectedAt,
        claimExpiresAt: winnerRecord.winner.claimExpiresAt,
        prizePool: winnerRecord.prizePool,
        weekStart: winnerRecord.weekStart
      }
    });

  } catch (error) {
    console.error('❌ Winner check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error checking winner status'
    });
  }
} 