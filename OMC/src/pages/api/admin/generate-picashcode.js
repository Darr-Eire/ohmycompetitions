// pages/api/admin/generate-picashcode.js

import { dbConnect } from '../../../lib/dbConnect';
import PiCashCode from '../../../models/PiCashCode';

// Simple admin protection — replace with real auth system later
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'supersecret'; 

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { secret } = req.body;
  if (secret !== ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });

  // Calculate week start (Monday 00:00 UTC)
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // Sunday = 0
  const diff = (dayOfWeek + 6) % 7; 
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);

  const weekStart = monday.toISOString().split('T')[0];

  // Generate random code (XXXX-XXXX)
  const code = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const dropAt = new Date(monday);
  dropAt.setUTCHours(15, 14, 0, 0); // Monday 3:14 PM UTC

  const expiresAt = new Date(dropAt);
  expiresAt.setHours(expiresAt.getHours() + 31);
  expiresAt.setMinutes(expiresAt.getMinutes() + 4);

  try {
    const newCode = await PiCashCode.create({
      weekStart,
      code,
      dropAt,
      expiresAt,
      prizePool: 0,
      ticketsSold: 0,
    });

    res.json({ success: true, data: newCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate code' });
  }
}
