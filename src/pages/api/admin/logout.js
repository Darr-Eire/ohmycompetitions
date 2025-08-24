// pages/api/admin/logout.js
import { clearAdminSession } from '@/lib/auth';

export default function handler(req, res) {
  clearAdminSession(res);
  return res.status(200).json({ success: true });
}
