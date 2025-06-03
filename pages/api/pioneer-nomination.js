// pages/api/pioneer-nomination.js

import dbConnect from 'lib/dbConnect'
import PioneerNomination from 'models/PioneerNomination'

export default async function handler(req, res) {
  await dbConnect()

  const { method } = req

  switch (method) {
    case 'POST': {
      const { name, reason, action } = req.body
      if (!name || (!reason && action !== 'vote')) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      try {
        if (action === 'vote') {
          const nominee = await PioneerNomination.findOne({ name })
          if (!nominee) return res.status(404).json({ error: 'Nominee not found' })
          nominee.votes += 1
          await nominee.save()
          return res.status(200).json({ message: 'Vote recorded', nominee })
        } else {
          const existing = await PioneerNomination.findOne({ name })
          if (existing) return res.status(409).json({ error: 'Name already nominated' })

          const newNomination = new PioneerNomination({ name, reason })
          await newNomination.save()
          return res.status(201).json({ message: 'Nomination submitted', newNomination })
        }
      } catch (err) {
        console.error('API error:', err)
        return res.status(500).json({ error: 'Internal Server Error' })
      }
    }

    case 'GET': {
      try {
        const nominations = await PioneerNomination.find().sort({ votes: -1 })
        return res.status(200).json(nominations)
      } catch (err) {
        console.error('Fetch error:', err)
        return res.status(500).json({ error: 'Failed to fetch nominations' })
      }
    }

    default:
      return res.status(405).json({ error: `Method ${method} Not Allowed` })
  }
}
