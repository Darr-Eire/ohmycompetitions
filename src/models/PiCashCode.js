// models/PiCashCode.js
import mongoose from 'mongoose';

const PiCashCodeSchema = new mongoose.Schema({
  code: String,
  prizePool: Number,
  weekStart: String, // YYYY-MM-DD
  expiresAt: Date,
  drawAt: Date,
  claimExpiresAt: Date,
}, { timestamps: true });

export default mongoose.models.PiCashCode || mongoose.model('PiCashCode', PiCashCodeSchema);
