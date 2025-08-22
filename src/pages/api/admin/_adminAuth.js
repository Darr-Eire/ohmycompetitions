// Simple header-based admin guard used by all admin APIs.
// Expects headers: x-admin-username, x-admin-password
export function requireAdmin(req, res) {
  const u = req.headers['x-admin-username'];
  const p = req.headers['x-admin-password'];

  if (
    !u || !p ||
    u !== process.env.ADMIN_USERNAME ||
    p !== process.env.ADMIN_PASSWORD
  ) {
    res.status(403).json({ message: 'Forbidden: Invalid credentials' });
    return false;
  }
  return true;
}
