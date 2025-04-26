// pages/api/auth/pi-login.js
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { accessToken } = req.query;
  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(400).json({ error: 'Missing accessToken' });
  }

  try {
    // TODO: validate the accessToken with Pi’s backend if needed

    // For demo, we mock a user session
    const user = { uid: '123', username: 'pi_user' };

    // Set an HTTP-only cookie
    res.setHeader('Set-Cookie', serialize('session', JSON.stringify(user), {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    }));

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
