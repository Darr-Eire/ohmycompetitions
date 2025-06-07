import mongoose from 'mongoose';

const PiCashCodeSchema = new mongoose.Schema({
  code: { type: String, required: true },
  prizePool: { type: Number, required: true },
  weekStart: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  drawAt: { type: Date, required: true },
  claimExpiresAt: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.models.PiCashCode || mongoose.model('PiCashCode', PiCashCodeSchema);
