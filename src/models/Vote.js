import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema({
  userUid: { type: String, required: true, unique: true }, // One vote per user total
  nomineeName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create compound index to prevent duplicate votes
VoteSchema.index({ userUid: 1, nomineeName: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model('Vote', VoteSchema);
