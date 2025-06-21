// pages/api/auth/logout.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Clear any session data if needed
    // If you're using cookies, clear them here
    res.setHeader('Set-Cookie', [
      'auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
    ]);

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
}
