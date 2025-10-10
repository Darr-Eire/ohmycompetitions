// src/pages/api/admin/verify.js
import { requireAdmin } from '../../../lib/adminAuth';

export default function handler(req, res) {
  try {
    requireAdmin(req);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(err.statusCode || 403).json({
      success: false,
      error: err.message || 'Forbidden',
    });
  }
}
