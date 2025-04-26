// pages/api/auth/logout.js

export default function handler(req, res) {
  // Only allow POST or GET as needed
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', ['POST', 'GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  // Clear authentication cookies
  res.setHeader('Set-Cookie', [
    // Adjust the cookie name/path as needed for your auth setup
    `token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax`,
  ])

  // You can redirect or just return JSON
  return res.status(200).json({ message: 'Logged out' })
}
