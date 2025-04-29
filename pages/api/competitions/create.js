// pages/api/competitions/create.js
import clientPromise from '../../../src/lib/mongodb'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end()
  }

  const { title, prize, entryFee, slug } = req.body
  if (!title || !slug) {
    return res.status(400).json({ error: 'Title and slug required' })
  }

  try {
    const client = await clientPromise
    const db = client.db('ohmycompetitions')
    const now = new Date()
    const doc = { title, prize, entryFee, slug, createdAt: now, ticketsSold: 0 }
    const result = await db.collection('competitions').insertOne(doc)
    return res.status(201).json({ _id: result.insertedId, ...doc })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
