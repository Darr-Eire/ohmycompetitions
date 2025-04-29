// pages/api/competitions/[id]/enter.js
import { createPiPaymentSession } from '@/lib/pi'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { id } = req.query
  // 1. Look up the competition to get its entryFee
  const client = await clientPromise
  const comp = await client.db('ohmycompetitions')
    .collection('competitions')
    .findOne({ _id: new ObjectId(id) })

  if (!comp) return res.status(404).json({ error: 'Not found' })

  // 2. Create the Pi payment session
  const paymentUrl = await createPiPaymentSession({
    competitionId: id,
    amount: comp.entryFee || 0,
    memo: `Entry fee for ${comp.title}`,
  })

  // 3. Return that URL
  res.status(200).json({ paymentUrl })
}
