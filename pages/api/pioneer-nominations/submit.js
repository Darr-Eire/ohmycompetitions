// pages/api/pioneer-nominations/submit.js
import dbConnect from '@/lib/dbConnect'
import Nomination from '@/models/Nomination'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, reason } = req.body
  if (!name || !reason) return res.status(400).json({ error: 'Missing name or reason' })

  try {
    await dbConnect()
    const newNomination = await Nomination.create({ name, reason })
    res.status(201).json(newNomination)
  } catch (err) {
    console.error('Submit error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}
