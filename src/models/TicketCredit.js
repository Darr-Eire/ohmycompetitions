import mongoose from 'mongoose';

const TicketCreditSchema = new mongoose.Schema({
  userId: { type: String, index: true, required: true },        // username, uid, or your canonical id
  competitionSlug: { type: String, index: true, required: true },
  quantity: { type: Number, default: 1, min: 1 },

  source: {
    type: String,
    enum: ['payment', 'gift', 'voucher', 'admin-grant'],
    default: 'admin-grant'
  },

  // Optional metadata
  code: String,          // if from a voucher/code
  grantedBy: String,     // admin username/id
  reason: String,        // “prize”, etc.
}, { timestamps: true });

TicketCreditSchema.index({ userId: 1, competitionSlug: 1 });

export default mongoose.models.TicketCredit
  || mongoose.model('TicketCredit', TicketCreditSchema);
