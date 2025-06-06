import dbConnect from '../../../lib/dbConnect';
import Battle from '../../../models/Battle';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'POST') return res.status(405).end();

  const { boxId, entryFee, userId, username, maxPlayers } = req.body;

  const battle = await Battle.create({
    boxId,
    entryFee,
    players: [{ userId, username, joinedAt: new Date() }],
    maxPlayers
  });

  res.status(200).json(battle);
}
