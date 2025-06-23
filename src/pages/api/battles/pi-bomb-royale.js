import { dbConnect } from 'lib/dbConnect';
import Battle from 'models/Battle';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    // Fetch battles for Pi Bomb Royale
    const battles = await Battle.find({ mode: 'pi-bomb-royale' });
    return res.status(200).json(battles);
  }

  if (req.method === 'POST') {
    // Create a new battle
    const { inviteCode } = req.body;
    const newBattle = new Battle({
      name: `Pi Bomb Royale ${Date.now()}`,
      status: 'Waiting for Players',
      inviteCode: inviteCode || nanoid(),
      mode: 'pi-bomb-royale',
      players: [],
    });

    await newBattle.save();
    return res.status(201).json(newBattle);
  }

  res.status(405).end(); // Method Not Allowed
}
