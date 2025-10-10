// models/VoucherRedemption.js
import mongoose from 'mongoose';

const VoucherRedemptionSchema = new mongoose.Schema({
  voucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', index: true, required: true },
  userId: { type: String, index: true, required: true },
  competitionSlug: { type: String, required: true },
  ticketCount: { type: Number, required: true },
  requestId: { type: String, index: true }, // for idempotency if you pass one
  userAgent: { type: String },
  ip: { type: String },
}, { timestamps: true });

export default mongoose.models.VoucherRedemption || mongoose.model('VoucherRedemption', VoucherRedemptionSchema);
