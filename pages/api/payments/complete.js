export default async function handler(req, res) {
    const { paymentId, txid } = req.body
    const apiRes = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Key ${process.env.PI_API_KEY}`,
        },
        body: JSON.stringify({ txid }),
      }
    )
    const data = await apiRes.json()
    res.status(apiRes.ok ? 200 : apiRes.status).json(data)
  }
  