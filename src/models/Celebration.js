import mongoose from 'mongoose';

const CelebrationSchema = new mongoose.Schema({
  name: String,
  story: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Celebration || mongoose.model('Celebration', CelebrationSchema);
