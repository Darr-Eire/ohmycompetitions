import { dbConnect } from 'lib/dbConnect';
import MysteryBox from 'models/MysteryBox';
import User from 'models/User';
import GameResult from 'models/GameResult';

// Helper function to select reward based on probabilities
function selectReward(rewards) {
  const rand = Math.random();
  let sum = 0;
  
  for (let i = 0; i < rewards.length; i++) {
    sum += rewards[i].chance;
    if (rand < sum) {
      return rewards[i];
    }
  }
  
  // Fallback to last reward if somehow no reward was selected
  return rewards[rewards.length - 1];
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { boxId, userUid, username } = req.body;

  if (!boxId || !userUid || !username) {
    return res.status(400).json({ 
      error: 'Missing required fields: boxId, userUid, username' 
    });
  }

  try {
    // Find the mystery box
    const mysteryBox = await MysteryBox.findOne({ id: boxId, isActive: true });
    
    if (!mysteryBox) {
      return res.status(404).json({ error: 'Mystery box not found or inactive' });
    }

    // Find the user
    const user = await User.findOne({ 
      $or: [{ piUserId: userUid }, { username: username }] 
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Select a reward based on probabilities
    const selectedReward = selectReward(mysteryBox.rewards);

    // Save the game result
    const gameResult = await GameResult.create({
      userUid: user.piUserId || userUid,
      game: 'mystery_box',
      result: selectedReward.name,
      prizeAmount: selectedReward.value.includes('Pi') ? 
        parseFloat(selectedReward.value.match(/[\d.]+/)?.[0] || '0') : 0,
      metadata: {
        boxId: mysteryBox.id,
        boxName: mysteryBox.name,
        boxPrice: mysteryBox.priceInPi,
        rewardValue: selectedReward.value
      }
    });

    // Apply the reward to the user
    let rewardApplied = false;
    let rewardMessage = '';

    if (selectedReward.name.includes('Pi') && selectedReward.value.includes('Pi')) {
      // Pi reward
      const piAmount = parseFloat(selectedReward.value.match(/[\d.]+/)?.[0] || '0');
      if (piAmount > 0) {
        // Note: You would need to implement Pi payout logic here
        rewardMessage = `Won ${piAmount} π! Check your Pi wallet.`;
        rewardApplied = true;
      }
    } else if (selectedReward.name.includes('Ticket')) {
      // Ticket reward
      const ticketAmount = parseInt(selectedReward.value.match(/\d+/)?.[0] || '0');
      if (ticketAmount > 0) {
        await User.findByIdAndUpdate(user._id, {
          $inc: { bonusTickets: ticketAmount }
        });
        rewardMessage = `Won ${ticketAmount} bonus ticket${ticketAmount > 1 ? 's' : ''}!`;
        rewardApplied = true;
      }
    } else if (selectedReward.name === 'No Reward') {
      rewardMessage = 'Better luck next time!';
      rewardApplied = true;
    }

    res.status(200).json({
      success: true,
      reward: {
        name: selectedReward.name,
        value: selectedReward.value,
        message: rewardMessage
      },
      mysteryBox: {
        name: mysteryBox.name,
        image: mysteryBox.imageUrl,
        themeColor: mysteryBox.themeColor
      },
      gameResultId: gameResult._id,
      rewardApplied
    });

  } catch (error) {
    console.error('Error opening mystery box:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to open mystery box'
    });
  }
} 