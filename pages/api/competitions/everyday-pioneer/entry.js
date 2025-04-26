// pages/api/competitions/everyday-pioneer/entry.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST'])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  
    // TODO: Authenticate the user here (e.g. check req.cookies or session)
    // if not authenticated:
    //   return res.status(401).json({ message: 'Not authenticated' })
  
    const { transaction, tickets } = req.body
  
    // TODO: Verify the transaction with Pi backend or cryptographic checks
    // const valid = await verifyTransactionWithPi(transaction)
    // if (!valid) return res.status(400).json({ message: 'Invalid transaction' })
  
    // TODO: Record the entry in your database
    // await db.insertEntry({ userId, competition: 'everyday-pioneer', tickets, txId: transaction.id })
  
    return res.status(200).json({ message: 'Entry recorded (stub)' })
  }
  