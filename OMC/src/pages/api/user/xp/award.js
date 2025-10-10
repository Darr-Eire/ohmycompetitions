// src/pages/api/user/xp/award.js
import { dbConnect } from 'lib/dbConnect';
import User from 'models/User';
import { PI_PER_XP } from 'lib/xp';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const {
      userId,
      username,
      amount,
      reason,
      source = 'manual', // 'payment' | 'win' | 'referral' | 'admin' | 'manual'
    } = req.body || {};

    if (!userId && !username) {
      return res.status(400).json({ message: 'Missing required fields: userId or username' });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }
    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    const user = await User.findOne({
      $or: [
        userId ? { uid: userId } : null,
        userId ? { piUserId: userId } : null,
        userId && mongoose.isValidObjectId(userId) ? { _id: new mongoose.Types.ObjectId(userId) } : null,
        username ? { username } : null,
      ].filter(Boolean),
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Convert Pi -> XP if the source is a payment
    let xpToAward = amount;
    if (source === 'payment') {
      const per = PI_PER_XP || 0.15; // fallback
      xpToAward = Math.floor(amount / per);
      if (!Number.isFinite(xpToAward) || xpToAward <= 0) {
        return res.status(400).json({ message: 'Calculated XP is zero or invalid' });
      }
    }

    const newXP = (user.xp || 0) + xpToAward;
    const newLevel = calculateLevel(newXP);

    const xpHistoryEntry = {
      amount: xpToAward,
      reason,
      source,
      createdAt: new Date(),
      balance: newXP,
    };

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { xp: newXP, level: newLevel }, $push: { xpHistory: xpHistoryEntry } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Awarded ${xpToAward} XP to ${user.username}`,
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        xp: updatedUser.xp,
        level: updatedUser.level,
      },
      xpAwarded: xpToAward,
      reason,
      source,
    });
  } catch (error) {
    console.error('Error awarding XP:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Simple level curve
function calculateLevel(xp) {
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 500) return 3;
  if (xp < 1000) return 4;
  if (xp < 2000) return 5;
  if (xp < 3500) return 6;
  if (xp < 5500) return 7;
  if (xp < 8000) return 8;
  if (xp < 11000) return 9;
  if (xp < 15000) return 10;
  return 10 + Math.floor((xp - 15000) / 5000) + 1;
}
