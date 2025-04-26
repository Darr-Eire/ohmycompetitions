// pages/api/competitions/everyday-pioneer/entry.js
import { verifyPiTransaction } from '../../../lib/pi'   // your helper
import { getSession } from '../../../lib/session'       // your auth

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getSession(req)
  if (!session?.user) return res.status(401).json({ message: 'Not authenticated' })

  const { transaction, tickets } = req.body

  // Verify with Pi that this tx is valid, paid, and not reused
  const valid = await verifyPiTransaction(transaction)
  if (!valid) return res.status(400).json({ message: 'Invalid transaction' })

  // Record the entry in your DB
  await db.insert('entries', {
    userId: session.user.id,
    competition: 'everyday-pioneer',
    tickets,
    txId: transaction.id,
    amount: transaction.amount,
    timestamp: new Date(),
  })

  return res.status(200).json({ message: 'Entry recorded' })
}
