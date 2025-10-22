// file: src/pages/api/admin/whoami.js
import { verifySignedCookie } from 'lib/adminHeaderGuard';

const COOKIE_NAME = 'omc_admin';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookieHeader = req.headers.cookie || '';
  const raw = cookieHeader
    .split(';')
    .map((s) => s.trim())
    .find((p) => p.startsWith(COOKIE_NAME + '='))?.split('=')[1];

  const session = verifySignedCookie(raw);

  return res.status(200).json({
    cookiePresent: !!raw,
    sessionValid: !!session && session.role === 'admin',
    session: session && session.role === 'admin' ? session : null,
  });
}
