// pages/api/pi-cash-code-purchase.js
import { dbConnect } from '../../lib/dbConnect';
import PiCashCode from '../../models/PiCashCode';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { weekStart, quantity, paymentId, txid, userId, username } = req.body;

    // Validate required fields
    if (!weekStart || !quantity || !paymentId || !txid) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the Pi Cash Code for this week
    const piCashCode = await PiCashCode.findOne({ weekStart: new Date(weekStart) });
    
    if (!piCashCode) {
      return res.status(404).json({ error: 'Pi Cash Code not found for this week' });
    }

    // Check if the code is still active
    const now = new Date();
    if (now > piCashCode.expiresAt) {
      return res.status(400).json({ error: 'Pi Cash Code has expired' });
    }

    // Update the Pi Cash Code with ticket purchase
    const updated = await PiCashCode.findOneAndUpdate(
      { _id: piCashCode._id },
      { 
        $inc: { 
          ticketsSold: quantity, 
          prizePool: quantity * 1.25 
        },
        $push: {
          claimAttempts: {
            uid: userId,
            username: username,
            submittedCode: 'TICKET_PURCHASE',
            timestamp: new Date(),
            success: true,
            paymentId: paymentId,
            txid: txid,
            quantity: quantity
          }
        }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(500).json({ error: 'Failed to update Pi Cash Code' });
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: `Successfully purchased ${quantity} ticket(s)`,
      ticketId: `PI-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      updatedCode: updated
    });

  } catch (error) {
    console.error('Pi Cash Code purchase error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
