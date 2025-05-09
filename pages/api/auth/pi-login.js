import { serialize } from 'cookie'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed')
  }

  const { accessToken } = req.body

  // 🔐 Optionally: verify accessToken with /me endpoint

  // Mock user object for now — replace with real user data from /me later
  const user = {
    uid: 'demo-uid', // use Pi /me result in real version
    username: 'demo_user',
    accessToken,
  }

  res.setHeader(
    'Set-Cookie',
    serialize('session', JSON.stringify(user), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
  )

  res.status(200).json({ success: true })
}
