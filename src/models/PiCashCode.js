// src/models/PiCashCode.js
import mongoose from 'mongoose';

const PiCashCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.PiCashCode || mongoose.model('PiCashCode', PiCashCodeSchema);
