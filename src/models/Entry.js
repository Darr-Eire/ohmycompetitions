// src/models/Entry.js
import mongoose from 'mongoose';

const EntrySchema = new mongoose.Schema({
  competitionId: { type: String },
  competitionSlug: { type: String, index: true },
  userId: { type: String },
  userUid: { type: String, index: true },
  username: { type: String },
  quantity: { type: Number, default: 1 },
  source: { type: String, default: 'purchase' }, // purchase | admin-grant | voucher | free
  reason: String,
  ticketNumbers: [String],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Entry || mongoose.model('Entry', EntrySchema);
