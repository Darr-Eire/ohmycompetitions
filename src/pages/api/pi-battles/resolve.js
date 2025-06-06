import dbConnect from '../../../lib/dbConnect';
import Battle from '../../../models/Battle';
import BattleResult from '../../../models/BattleResult';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'POST') return res.status(405).end();

  const { battleId } = req.body;
  const battle = await Battle.findById(battleId);
  if (!battle || battle.status !== 'full') return res.status(400).json({ error: 'Battle not ready' });

  const boxPrizes = [
    { prize: 'Legendary Item', value: 100 },
    { prize: 'Epic Item', value: 50 },
    { prize: 'Rare Item', value: 20 },
    { prize: 'Common Item', value: 5 },
    { prize: 'Trash', value: 1 }
  ];

  const playerResults = battle.players.map(player => {
    const prize = boxPrizes[Math.floor(Math.random() * boxPrizes.length)];
    return {
      userId: player.userId,
      username: player.username,
      prize: prize.prize,
      prizeValue: prize.value
    };
  });

  const winner = playerResults.reduce((prev, curr) => prev.prizeValue > curr.prizeValue ? prev : curr);
  const payout = battle.entryFee * battle.players.length;

  await BattleResult.create({
    battleId: battle._id,
    playerResults,
    winnerId: winner.userId,
    payout
  });

  battle.status = 'completed';
  await battle.save();

  res.status(200).json({ winner, playerResults, payout });
}
