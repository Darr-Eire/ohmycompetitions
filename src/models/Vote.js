import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema({
  choice: String,
  reason: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Vote || mongoose.model('Vote', VoteSchema);
