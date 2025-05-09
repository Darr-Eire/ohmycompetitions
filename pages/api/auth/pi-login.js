import { signIn } from 'next-auth/react'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { accessToken } = req.body
  if (!accessToken) return res.status(400).json({ error: 'Missing token' })

  const piRes = await fetch('https://api.minepi.com/v2/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!piRes.ok) {
    const msg = await piRes.text()
    return res.status(401).json({ error: 'Pi token invalid', detail: msg })
  }

  const piUser = await piRes.json()

  return signIn('credentials', {
    redirect: false,
    uid: piUser.uid,
    username: piUser.username,
    wallet: piUser.wallet?.address || null,
    accessToken,
  })
}
