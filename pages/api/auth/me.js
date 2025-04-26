// src/pages/api/auth/me.js
export default function handler(req, res) {
    const user = req.session?.user; // assuming your sessionMiddleware populates req.session
    if (user) {
      return res.status(200).json({ user });
    }
    res.status(401).json({ error: 'Not logged in' });
  }
  