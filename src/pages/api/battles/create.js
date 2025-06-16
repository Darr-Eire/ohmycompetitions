import { dbConnect } from 'lib/dbConnect';
import Battle from 'models/Battle';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { host, type, prize, inviteCode } = req.body;

    if (!host || !type || !prize) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const battle = new Battle({
      host,
      type,
      prize,
      inviteCode: type === 'friends' ? inviteCode : null,
      status: type === 'friends' ? 'Waiting for friend' : 'Waiting for opponent',
    });

    await battle.save();

    return res.status(201).json({ success: true, battle });
  } catch (error) {
    console.error('Error creating battle:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
