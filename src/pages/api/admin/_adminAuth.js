// src/lib/adminAuth.js
// Dependency-free admin gate: Bearer <ADMIN_BEARER_TOKEN>
import { requireAdmin } from 'lib/adminAuth';

export function requireAdmin(req, res) {
  const auth = req.headers.authorization || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();

  if (process.env.ADMIN_BEARER_TOKEN && token === process.env.ADMIN_BEARER_TOKEN) {
    return true;
  }
  if (res) res.status(401).json({ message: "Unauthorized" });
  return false;
}
