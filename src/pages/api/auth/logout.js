// file: src/pages/api/admin/logout.js
import { clearAuthCookies } from 'lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });
  }
  clearAuthCookies(res);
  return res.status(200).json({ success: true });
}
