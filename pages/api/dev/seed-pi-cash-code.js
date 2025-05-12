import { getDb } from '@/lib/mongodb'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const db = await getDb()

  const monday = getNextMondayAt314UTC();
  const expiresAt = new Date(monday.getTime() + (31 * 60 + 4) * 60 * 1000); // +31h 4m
  const drawAt = getNextFridayAt314UTC();
  const claimExpiresAt = new Date(drawAt.getTime() + (31 * 60 + 4) * 1000); // +31m 4s

  const newCode = {
    weekStart: monday,
    code: generateCode(),
    prizePool: 10000, // start prize
    expiresAt,
    drawAt,
    claimExpiresAt,
    ticketsSold: 0
  };

  await db.collection('pi_cash_codes').insertOne(newCode);

  res.status(200).json({ success: true, data: newCode });
}

// --- Helpers ---
function getNextMondayAt314UTC() {
  const now = new Date();
  const monday = new Date(now);
  monday.setUTCHours(15, 14, 0, 0);
  monday.setUTCDate(now.getUTCDate() + ((1 + 7 - now.getUTCDay()) % 7 || 7));
  return monday;
}

function getNextFridayAt314UTC() {
  const now = new Date();
  const friday = new Date(now);
  friday.setUTCHours(15, 14, 0, 0);
  friday.setUTCDate(now.getUTCDate() + ((5 + 7 - now.getUTCDay()) % 7 || 7));
  return friday;
}

function generateCode() {
  const part = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${part()}-${part()}`;
}
