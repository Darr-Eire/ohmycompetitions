import mongoose from 'mongoose';

const ThreadSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  category: { type: String, enum: ['general', 'vote', 'ideas', 'winners'], required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Thread || mongoose.model('Thread', ThreadSchema);
