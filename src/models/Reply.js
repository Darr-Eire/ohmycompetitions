import mongoose from 'mongoose'

const ReplySchema = new mongoose.Schema({
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread', required: true },
  userUid: { type: String, required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Reply || mongoose.model('Reply', ReplySchema)
