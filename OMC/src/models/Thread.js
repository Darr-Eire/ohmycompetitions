import mongoose from 'mongoose';

const ThreadSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['general', 'ideas', 'vote', 'winners', 'pioneer-week'],
    default: 'general'
  },
  author: { type: String, required: true },
  authorUid: { type: String }, // For authenticated users
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  replyCount: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now },
  isPinned: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  tags: [{ type: String }],
  views: { type: Number, default: 0 }
}, { 
  timestamps: true 
});

// Index for better performance
ThreadSchema.index({ category: 1, createdAt: -1 });
ThreadSchema.index({ lastActivity: -1 });
ThreadSchema.index({ slug: 1 });

export default mongoose.models.Thread || mongoose.model('Thread', ThreadSchema);
