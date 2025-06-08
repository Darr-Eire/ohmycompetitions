// pages/api/pi-cash-code-purchase.js
import { dbConnect } from '../../lib/dbConnect';
import PiCashCode from '../../models/PiCashCode';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'POST') {
    const { weekStart, quantity } = req.body;
    try {
      const updated = await PiCashCode.findOneAndUpdate(
        { weekStart },
        { $inc: { ticketsSold: quantity, prizePool: quantity * 1.25 } }, 
        { new: true }
      );
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not update tickets' });
    }
  }
}
