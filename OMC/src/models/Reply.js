// models/Reply.js
import mongoose from 'mongoose';

const ReplySchema = new mongoose.Schema({
  threadId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Thread', 
    required: true 
  },
  body: { type: String, required: true },
  author: { type: String, required: true },
  authorUid: { type: String }, // For authenticated users
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },
  parentReply: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Reply' 
  }, // For nested replies
}, { 
  timestamps: true 
});

// Index for better performance
ReplySchema.index({ threadId: 1, createdAt: 1 });

export default mongoose.models.Reply || mongoose.model('Reply', ReplySchema);
