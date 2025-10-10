import mongoose from 'mongoose';

const IdeaSchema = new mongoose.Schema({
  idea: String,
  reason: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Idea || mongoose.model('Idea', IdeaSchema);
