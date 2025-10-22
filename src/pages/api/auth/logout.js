// file: src/pages/api/admin/logout.js
import { clearAdminSessionCookie } from 'lib/adminHeaderGuard'; // add this helper if not present

export default function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).end(); }
  clearAdminSessionCookie(res);
  res.status(200).json({ ok: true });
}
