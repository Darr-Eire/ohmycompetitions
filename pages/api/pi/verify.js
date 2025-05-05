// pages/api/pi/verify.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.setHeader('Allow', ['POST']).status(405).end('Method Not Allowed')
    }
  
    const { accessToken } = req.body
    if (!accessToken) {
      return res.status(400).json({ error: 'Missing accessToken' })
    }
  
    // Call Pi’s /v2/me endpoint
    const piRes = await fetch('https://api.minepi.com/v2/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  
    if (!piRes.ok) {
      // 401, expired token, etc.
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
  
    const data = await piRes.json()
    // data: { uid: string, username?: string }
    // At this point you can look up or create a user in your DB by data.uid
  
    return res.status(200).json({ uid: data.uid, username: data.username })
  }
  