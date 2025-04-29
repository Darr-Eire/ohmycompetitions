// pages/api/competitions/create.js
import clientPromise from '@/lib/mongodb'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const client = await clientPromise
    const db = client.db('ohmycompetitions') // ✅ make sure this matches your real DB name
    const collection = db.collection('competitions')

    const { title, prize, fee, slug } = req.body

    const result = await collection.insertOne({
      title,
      prize,
      entryFee: parseFloat(fee),
      slug,
      createdAt: new Date(),
      ticketsSold: 0,
    })

    return res.status(200).json({ success: true, insertedId: result.insertedId })
  } catch (err) {
    console.error('Insert error:', err)
    return res.status(500).json({ error: 'Failed to create competition' })
  }
}
