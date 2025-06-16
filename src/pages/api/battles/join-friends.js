import dbConnect from '@/lib/dbConnect';
import FriendsOnlyBattle from '@/models/FriendsOnlyBattle';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { inviteCode } = req.body;

    const battle = await FriendsOnlyBattle.findOne({ inviteCode });

    if (!battle) {
      return res.status(404).json({ success: false, error: 'Invite code not found' });
    }

    res.status(200).json({ success: true, battle });
  }
}
