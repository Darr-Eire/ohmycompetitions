import mongoose from 'mongoose';

const ForumThreadSchema = new mongoose.Schema({
  section: { type: String, required: true }, // general, vote, ideas, winners, pioneer-week
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true }, // username or Pi username
  createdAt: { type: Date, default: Date.now },
  upvotes: { type: Number, default: 0 },
  comments: [
    {
      author: { type: String },
      content: { type: String },
      postedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

export default mongoose.models.ForumThread || mongoose.model('ForumThread', ForumThreadSchema);
