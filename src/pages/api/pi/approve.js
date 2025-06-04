export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { paymentId } = req.body

  if (!paymentId) {
    return res.status(400).json({ error: 'Missing paymentId' })
  }

  try {
    const piRes = await fetch(`https://sandbox.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const responseText = await piRes.text()
    console.log('🔍 Pi API response:', responseText)

    if (!piRes.ok) {
      return res.status(500).json({ error: 'Approval failed', detail: responseText })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('❌ Approve error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

