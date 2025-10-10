// src/pages/api/session/pi.js
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { accessToken } = req.body || {};
    if (!accessToken) return res.status(400).json({ message: 'accessToken required' });

    // Verify the Pioneer on the Platform (/v2/me)
    const r = await fetch('https://api.minepi.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!r.ok) {
      const t = await r.text();
      return res.status(401).json({ message: 'Invalid accessToken', detail: t });
    }
    const me = await r.json(); // { uid, ... }

    // Sign a short-lived JWT for your app (what your middleware verifies)
    const jwt = await new SignJWT({ sub: me.uid, uid: me.uid })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // Set HttpOnly cookie
    const cookie = [
      `token=${jwt}`,
      'HttpOnly',
      'Path=/',
      'SameSite=Lax',
      process.env.NODE_ENV === 'production' ? 'Secure' : '',
      'Max-Age=604800', // 7d
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ ok: true, uid: me.uid });
  } catch (err) {
    console.error('session/pi error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
