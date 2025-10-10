

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({
      message: `Welcome back, ${user.username}!`,
      uid: user.uid,
    });
  } catch (err) {
    console.error('❌ Auth error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
