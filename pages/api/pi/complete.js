// pages/api/pi/complete.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Method Not Allowed')
  }

  const { paymentId, txid } = req.body
  if (!paymentId || !txid) {
    return res.status(400).json({ error: 'Missing paymentId or txid' })
  }

  const serverKey = process.env.PI_SERVER_API_KEY
  if (!serverKey) {
    console.error('Missing PI_SERVER_API_KEY')
    return res.status(500).json({ error: 'Server misconfiguration' })
  }

  try {
    const piRes = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Key ${serverKey}`,
        },
        body: JSON.stringify({ txid }),
      }
    )

    const data = await piRes.json()
    if (!piRes.ok) {
      // forward Pi’s error
      return res.status(piRes.status).json({ error: data })
    }

    // data is the completed PaymentDTO
    return res.status(200).json(data)
  } catch (err) {
    console.error('Error completing Pi payment:', err)
    return res.status(502).json({ error: 'Bad gateway' })
  }
}
