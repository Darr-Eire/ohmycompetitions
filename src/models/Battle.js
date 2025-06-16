import mongoose from 'mongoose';

const BattleSchema = new mongoose.Schema({
  host: String,
  type: { type: String, enum: ['open', 'friends'] },
  prize: Number,
  inviteCode: String,
  status: String,
}, { timestamps: true });

export default mongoose.models.Battle || mongoose.model('Battle', BattleSchema);
