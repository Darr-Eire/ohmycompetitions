export default async function handler(req, res) {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).end()
    const piRes = await fetch("https://api.minepi.com/v2/me", {
      headers: { Authorization: auth },
    })
    const data = await piRes.json()
    res.status(piRes.ok ? 200 : piRes.status).json(data)
  }
  