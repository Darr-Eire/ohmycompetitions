import { dbConnect } from 'lib/dbConnect';
import MysteryBox from 'models/MysteryBox';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      // Fetch all active mystery boxes
      const mysteryBoxes = await MysteryBox.find({ isActive: true })
        .sort({ sortOrder: 1, priceInPi: 1 })
        .lean();

      // Format for frontend compatibility
      const formattedBoxes = mysteryBoxes.map(box => ({
        id: box.id,
        name: box.name,
        priceInPi: box.priceInPi,
        rewards: box.rewards.map(reward => reward.name),
        chances: box.rewards.map(reward => reward.chance),
        image: box.imageUrl || `https://cdn.example.com/images/${box.id}-box.png`,
        themeColor: box.themeColor,
        description: box.description,
        rarity: box.rarity
      }));

      res.status(200).json({
        success: true,
        data: formattedBoxes
      });
    } catch (error) {
      console.error('Error fetching mystery boxes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch mystery boxes'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 