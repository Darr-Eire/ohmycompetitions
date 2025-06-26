// src/models/PiCashCode.js
import mongoose from 'mongoose';

const PiCashCodeSchema = new mongoose.Schema({
  code: { type: String, required: true },
  weekStart: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  drawAt: { type: Date, required: true },
  claimExpiresAt: { type: Date, required: true },
  prizePool: { type: Number, required: true },
  ticketsSold: { type: Number, default: 0 },
  claimed: { type: Boolean, default: false },
  winner: {
    uid: String,
    username: String,
    selectedAt: Date,
    claimExpiresAt: Date
  },
  claimAttempts: [{
    uid: String,
    username: String,
    submittedCode: String,
    timestamp: { type: Date, default: Date.now },
    success: Boolean
  }],
  rolloverFrom: String, // Reference to previous week if unclaimed
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.PiCashCode || mongoose.model('PiCashCode', PiCashCodeSchema);
