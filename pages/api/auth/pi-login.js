import { serialize } from 'cookie'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { accessToken } = req.body

  if (!accessToken) {
    return res.status(400).json({ error: 'Missing accessToken' })
  }

  // Dummy user data for now — replace with real user lookup later if needed
  const user = {
    uid: 'temp-uid',
    username: 'temp-user',
    accessToken,
  }

  res.setHeader('Set-Cookie', serialize(
    'session',
    JSON.stringify(user),
    {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    }
  ))

  return res.status(200).json({ success: true })
}

