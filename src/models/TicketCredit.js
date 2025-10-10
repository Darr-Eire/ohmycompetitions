// src/models/TicketCredit.js
import mongoose from 'mongoose';

const TicketCreditSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true, required: true }, // username, uid, or your canonical id
    username: { type: String, index: true },
    competitionSlug: { type: String, index: true, required: true },
    quantity: { type: Number, default: 1, min: 1 },        // canonical
    // (Optional legacy) keep `qty` mirror to be compatible with older writes
    qty: { type: Number, default: 1, min: 1 },
    source: {
      type: String,
      enum: ['payment', 'gift', 'voucher', 'admin-grant', 'stage', 'xp', 'prize'],
      default: 'admin-grant',
    },
    code: String,
    grantedBy: String,
    reason: String,
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    reservedTicketNumbers: { type: [String], default: [] },
    used: { type: Boolean, default: false },
    usedAt: { type: Date },
  },
  { timestamps: true }
);

TicketCreditSchema.index({ userId: 1, competitionSlug: 1 });
TicketCreditSchema.index({ username: 1, competitionSlug: 1 });

export default mongoose.models.TicketCredit ||
  mongoose.model('TicketCredit', TicketCreditSchema);
