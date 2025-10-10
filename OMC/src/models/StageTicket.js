import mongoose from 'mongoose';

const StageTicketSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  username: { type: String, index: true },
  stage: { type: Number, required: true, min: 1 },
  count: { type: Number, default: 1, min: 0 },
  consumed: { type: Number, default: 0, min: 0 },
  expiresAt: { type: Date },
  source: { type: String, default: 'payment' }, // payment|win|admin
}, { timestamps: true });

StageTicketSchema.index({ username: 1, stage: 1 });

export default mongoose.models.StageTicket || mongoose.model('StageTicket', StageTicketSchema);


