// models/Thread.js
import mongoose from 'mongoose';

const ThreadSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    userUid: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Thread || mongoose.model('Thread', ThreadSchema);
