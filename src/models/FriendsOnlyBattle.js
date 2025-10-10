import mongoose from 'mongoose';

const FriendsOnlyBattleSchema = new mongoose.Schema({
  host: { type: String, required: true },
  prize: { type: String, required: true },
  inviteCode: { type: String, required: true, unique: true },
  status: { type: String, default: 'Waiting for opponent' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.FriendsOnlyBattle || mongoose.model('FriendsOnlyBattle', FriendsOnlyBattleSchema);
