import { clientPromise } from 'lib/mongodb';


export default async function handler(req, res) {
  const client = await clientPromise
  const db = client.db()

  if (req.method === 'GET') {
    const activeCode = await db.collection('pi_cash_codes').findOne({
      expiresAt: { $gt: new Date() },
    }, { sort: { weekStart: -1 } })

    return res.status(200).json(activeCode)
  }

  if (req.method === 'POST') {
    const { code, weekStart, expiresAt, drawAt, claimExpiresAt, prizePool } = req.body

    const newCode = await db.collection('pi_cash_codes').insertOne({
      code,
      weekStart: new Date(weekStart),
      expiresAt: new Date(expiresAt),
      drawAt: new Date(drawAt),
      claimExpiresAt: new Date(claimExpiresAt),
      prizePool,
      claimed: false,
      winner: null,
      rolloverFrom: null,
    })

    return res.status(201).json(newCode)
  }

  return res.status(405).end() // Method Not Allowed
}
