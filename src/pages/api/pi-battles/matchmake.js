import dbConnect from '../../../lib/dbConnect';
import Battle from '../../../models/Battle';

export default async function handler(req, res) {
  await dbConnect();

  const { userId, username, boxId, entryFee } = req.body;

  // Try to find open battle
  let battle = await Battle.findOne({ status: 'open', maxPlayers: 2 });

  // If no open battle exists, create new one
  if (!battle) {
    battle = await Battle.create({
      boxId,
      entryFee,
      players: [],
      maxPlayers: 2
    });
  }

  // Check if user already joined this battle
  const alreadyJoined = battle.players.find(p => p.userId === userId);
  if (alreadyJoined) {
    return res.status(200).json(battle);
  }

  // Join this battle
  battle.players.push({ userId, username, joinedAt: new Date() });

  if (battle.players.length >= 2) {
    battle.status = 'full';
  }

  await battle.save();

  res.status(200).json(battle);
}
