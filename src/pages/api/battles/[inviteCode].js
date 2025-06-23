import { dbConnect } from 'lib/dbConnect';
import Battle from 'models/Battle';

export default async function handler(req, res) {
  const {
    query: { inviteCode },
    method,
  } = req;

  await dbConnect();

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const battle = await Battle.findOne({ inviteCode });
    if (!battle) return res.status(404).json({ error: 'Battle not found' });

    res.status(200).json({ success: true, battle });
  } catch (error) {
    console.error('Find by Invite Code Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
