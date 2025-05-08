// models/Reply.js
import mongoose from 'mongoose';

const ReplySchema = new mongoose.Schema(
  {
    threadId: { type: String, required: true },
    userUid: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Reply || mongoose.model('Reply', ReplySchema);
