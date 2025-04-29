// pages/api/competitions/[id]/enter.js
import { ObjectId } from 'mongodb'
import clientPromise from '../../../../src/lib/mongodb'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { id } = req.query
  // TODO: verify session & payment logic
  const client = await clientPromise
  const db = client.db('ohmycompetitions')
  // e.g. call Pi‐SDK to create a payment session
  const paymentUrl = await createPiPaymentSession({ competitionId: id })
  return res.status(200).json({ paymentUrl })
}
