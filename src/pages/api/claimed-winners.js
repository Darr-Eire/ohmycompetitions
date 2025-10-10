import { dbConnect } from 'lib/dbConnect'
import mongoose from 'mongoose'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    await dbConnect()
    console.log('🌐 Connected to DB, fetching claimed winners...')

    const db = mongoose.connection.db

    // TEMP: Test loose query to confirm data exists
    const data = await db
      .collection('pi_cash_codes')
      .find({})
      .limit(5)
      .toArray()

    if (!data.length) {
      console.log('⚠️ No documents found in pi_cash_codes collection')
    } else {
      console.log(`✅ Found ${data.length} documents`)
    }

    res.status(200).json(data)
  } catch (err) {
    console.error('❌ [ERROR] /api/claimed-winners:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
