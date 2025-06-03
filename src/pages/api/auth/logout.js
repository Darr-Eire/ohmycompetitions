// pages/api/auth/logout.js

export default function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', ['POST', 'GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  // Correctly clear the pi_token cookie
  res.setHeader('Set-Cookie', [
    `pi_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict`,
  ])

  return res.status(200).json({ message: 'Logged out' })
}
