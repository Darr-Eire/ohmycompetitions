// at top of /api/competitions.js
import dbConnect from '../../lib/dbConnect';

import Competition from '@/models/Competition'
import mongoose from 'mongoose'

export default async function handler(req, res) {
  await dbConnect()
  const { id } = req.query

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  if (req.method === 'DELETE') {
    await Competition.findByIdAndDelete(id)
    return res.status(200).json({ message: 'Deleted' })
  }

  res.status(405).json({ message: 'Method not allowed' })
}
