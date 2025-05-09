export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { paymentId } = req.body

  if (!paymentId) {
    console.warn('❌ Missing paymentId in request')
    return res.status(400).json({ error: 'Missing paymentId' })
  }

  // Rest of approval logic here...
