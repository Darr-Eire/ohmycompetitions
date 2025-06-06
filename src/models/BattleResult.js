import mongoose from 'mongoose';

const BattleResultSchema = new mongoose.Schema({
  battleId: String,
  playerResults: [{
    userId: String,
    username: String,
    prize: String,
    prizeValue: Number
  }],
  winnerId: String,
  payout: Number,
  completedAt: { type: Date, default: Date.now }
});

export default mongoose.models.BattleResult || mongoose.model('BattleResult', BattleResultSchema);
