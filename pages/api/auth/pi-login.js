import { serialize } from 'cookie'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const accessToken = req.query.accessToken
  if (!accessToken) {
    return res.status(400).json({ error: 'Missing accessToken' })
  }

  // Optionally, verify the token server-side via Pi’s /me endpoint here.
  // For demo, we just accept it and set a session cookie:

  const user = { uid: '123', username: 'demo_user' }

  res.setHeader(
    'Set-Cookie',
    serialize(
      'session',
      JSON.stringify({ ...user, accessToken }),
      {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      }
    )
  )

  res.status(200).json({ success: true, user })
}
