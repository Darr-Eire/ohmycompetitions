import { getDb } from '@/lib/mongodb'

export default async function handler(req, res) {
  const db = await getDb()

  if (req.method === 'GET') {
    try {
      const code = await db.collection('pi_cash_codes').findOne(
        { expiresAt: { $gt: new Date() } }, // still active
        { sort: { weekStart: -1 } } // latest week first
      )

      if (!code) {
        return res.status(404).json({ error: 'No active code found' })
      }

      return res.status(200).json(code)
    } catch (err) {
      console.error('GET /api/pi-cash-code error:', err)
      return res.status(500).json({ error: 'Server error while fetching code' })
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' })
}
