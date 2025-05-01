export default async function handler(req, res) {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).end()
  
    const piRes = await fetch("https://api.minepi.com/v2/me", {
      headers: { Authorization: auth },
    })
    if (!piRes.ok) {
      const err = await piRes.json()
      return res.status(piRes.status).json(err)
    }
    const me = await piRes.json()
    res.status(200).json(me)
  }
  