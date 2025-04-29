// pages/api/competitions/[id].js
import { ObjectId } from 'mongodb'
import clientPromise from '../../../src/lib/mongodb'

export default async function handler(req, res) {
  const { id } = req.query

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  try {
    const client = await clientPromise
    const db = client.db('ohmycompetitions') // explicitly select your DB

    if (req.method === 'DELETE') {
      const result = await db
        .collection('competitions')
        .deleteOne({ _id: new ObjectId(id) })

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Not found' })
      }
      return res.status(200).json({ message: 'Deleted' })
    }

    res.setHeader('Allow', ['DELETE'])
    return res
      .status(405)
      .json({ error: `Method ${req.method} Not Allowed` })
  } catch (err) {
    console.error(`❌ DELETE /api/competitions/${id} error:`, err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

