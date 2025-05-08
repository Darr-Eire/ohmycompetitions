import mongoose from 'mongoose'

const ThreadSchema = new mongoose.Schema({
  userUid: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  category: { type: String, default: 'General' }, // e.g. General, Vote, Ideas, Celebrate
  upvotes: { type: [String], default: [] }, // user UIDs that upvoted
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Thread || mongoose.model('Thread', ThreadSchema)
