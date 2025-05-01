export default async function handler(req, res) {
    const { paymentId } = req.body
    const apiRes = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Key ${process.env.PI_API_KEY}`,
        },
      }
    )
    const data = await apiRes.json()
    res.status(apiRes.ok ? 200 : apiRes.status).json(data)
  }
  