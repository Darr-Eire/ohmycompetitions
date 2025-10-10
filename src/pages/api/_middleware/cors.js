// src/pages/api/_middleware/cors.js (or per-route)
export default function withCors(handler) {
  return async (req, res) => {
    const allowed = process.env.NEXT_PUBLIC_ALLOWED_ORIGIN;
    const origin = req.headers.origin;
    if (allowed && origin && origin !== allowed) {
      return res.status(403).json({ message: 'Forbidden origin' });
    }
    return handler(req, res);
  };
}
