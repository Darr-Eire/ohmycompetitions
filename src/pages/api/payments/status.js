export default async function handler(req, res) {
  const { userUid } = req.query;

  if (!userUid) {
    return res.status(400).json({ error: 'Missing userUid' });
  }

  // TODO: Replace this with actual DB query if needed
  // For now, assume no pending payment
  return res.status(200).json({ pending: false });
}
