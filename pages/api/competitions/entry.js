// pages/api/competitions/everyday-pioneer/entry.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST'])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  
    const { transaction, tickets } = req.body
    // TODO: verify transaction with Pi backend, store entry in your DB
    // e.g. await verifyPiTransaction(transaction)
    // e.g. await db.insertEntry({ user: req.user, competition: 'everyday-pioneer', tickets })
  
    return res.status(200).json({ message: 'Entry recorded' })
  }
  