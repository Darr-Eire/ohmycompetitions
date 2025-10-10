import mongoose from 'mongoose';

const DiscussionSchema = new mongoose.Schema({
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Discussion || mongoose.model('Discussion', DiscussionSchema);
