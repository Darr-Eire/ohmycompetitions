// pages/api/auth/me.js
export default function handler(req, res) {
  const session = req.cookies.session && JSON.parse(req.cookies.session);
  if (!session?.username) {
    return res.status(401).end();
  }
  res.status(200).json({ username: session.username });
}
