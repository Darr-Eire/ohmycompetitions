import mongoose from 'mongoose';

const BattleSchema = new mongoose.Schema({
  boxId: String,
  entryFee: Number,
  players: [{
    userId: String,
    username: String,
    joinedAt: Date
  }],
  maxPlayers: Number,
  status: { type: String, enum: ['open', 'full', 'completed'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Battle || mongoose.model('Battle', BattleSchema);
