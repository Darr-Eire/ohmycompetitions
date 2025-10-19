// src/models/StageTicket.js
import mongoose from 'mongoose';

const StageTicketSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, index: true },
    stage: { type: Number, required: true, min: 2, index: true },
    count: { type: Number, default: 1 },
    consumed: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    source: { type: String, default: 'win' }, // optional metadata
  },
  { timestamps: true }
);

StageTicketSchema.index({ username: 1, stage: 1 }, { unique: true });

export default mongoose.models.StageTicket ||
  mongoose.model('StageTicket', StageTicketSchema);
