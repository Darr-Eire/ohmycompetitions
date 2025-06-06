// models/PiCashCode.js
import mongoose from 'mongoose';

const PiCashCodeSchema = new mongoose.Schema({
  weekStart: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  prizePool: { type: Number, default: 0 },
  ticketsSold: { type: Number, default: 0 },
  dropAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.models.PiCashCode || mongoose.model('PiCashCode', PiCashCodeSchema);
