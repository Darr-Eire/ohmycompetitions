// pages/api/competitions/[id]/enter.js
import { ObjectId } from 'mongodb';
import { clientPromise } from '../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end()
  }

  const { id } = req.query

  // Validate the competition ID
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid competition ID' })
  }

  try {
    // (Optional) Verify user session here, if you require auth

    // Ensure the competition exists
    const client = await clientPromise
    const db = client.db('ohmycompetitions')
    const comp = await db
      .collection('competitions')
      .findOne({ _id: new ObjectId(id) })

    if (!comp) {
      return res.status(404).json({ error: 'Competition not found' })
    }

    // Create a Pi payment session for this competition
    const paymentUrl = await createPiPaymentSession({
      competitionId: id,
      amount: comp.entryFee || 0,
      memo: `Entry fee for ${comp.title}`,
    })

    return res.status(200).json({ paymentUrl })
  } catch (err) {
    console.error(`POST /api/competitions/${id}/enter error:`, err)
    return res.status(500).json({ error: err.message })
  }
}
