// pages/api/pi-cash-code-claim.js

import { dbConnect } from '../../lib/dbConnect';
import PiCashCode from '../../models/PiCashCode';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { submittedCode, username } = req.body;

  try {
    const activeCode = await PiCashCode.findOne().sort({ weekStart: -1 });
    if (!activeCode) return res.status(404).json({ error: 'No active code found' });

    if (activeCode.code !== submittedCode) {
      return res.status(400).json({ success: false, message: 'Incorrect Code' });
    }

    // ✅ Code is correct: mark winner (you can expand to store winner list)
    activeCode.winner = username;
    await activeCode.save();

    res.json({ success: true, prize: activeCode.prizePool });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
