import dbConnect from '../../lib/dbConnect.js';
import PiCashCode from '../../models/PiCashCode.js';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const activeCode = await PiCashCode.findOne().sort({ weekStart: -1 }).lean();
      if (!activeCode) return res.status(404).json({ message: 'No active code' });
      res.json(activeCode);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  }
}
