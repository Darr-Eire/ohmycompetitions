import mongoose from 'mongoose';

const PiCashCodeSchema = new mongoose.Schema({
  code: { type: String, required: true },
  prizePool: { type: Number, required: true },
  weekStart: { type: Date, required: true },
  expiresAt: { type: Date, required: true }
});

export default mongoose.models.PiCashCode || mongoose.model('PiCashCode', PiCashCodeSchema);
