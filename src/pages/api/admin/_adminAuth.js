// src/pages/api/_adminAuth.js
export function requireAdmin(req) {
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();

  if (process.env.ADMIN_BEARER_TOKEN && token === process.env.ADMIN_BEARER_TOKEN) {
    return true;
  }
  const err = new Error('Unauthorized');
  err.statusCode = 401;
  throw err;
}
