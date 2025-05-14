
import PiCashCode from '@/models/PiCashCode';
import { connectToDatabase } from '@/lib/mongodb';

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let raw = '';
  for (let i = 0; i < 8; i++) {
    raw += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return raw.match(/.{1,4}/g).join('-');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const now = new Date();
    const weekStart = new Date();
    weekStart.setUTCHours(15, 14, 0, 0);
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay() + 1);

    const exists = await PiCashCode.findOne({ weekStart });
    if (exists) {
      return res.status(409).json({ message: 'Code for this week already exists', code: exists.code });
    }

    const newCode = generateCode();
    const expiresAt = new Date(weekStart.getTime() + (31 * 60 + 4) * 60 * 1000);

    const created = await PiCashCode.create({
      code: newCode,
      weekStart,
      expiresAt,
      claimed: false,
      prizePool: 0,
      createdAt: new Date()
    });

    res.status(201).json({ message: 'New code created', code: created.code });
  } catch (err) {
    console.error('Error seeding Pi Cash Code:', err);
    res.status(500).json({ error: 'Failed to create code' });
  }
}
