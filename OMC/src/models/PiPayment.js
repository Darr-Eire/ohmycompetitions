// src/models/PiPayment.js
import mongoose from 'mongoose';

const PiPaymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, unique: true, index: true },
    status: { type: String, default: 'pending' }, // pending | approved | completed
    amount: { type: Number, default: 0 },
    memo: { type: String, default: '' },
    username: { type: String },
    txid: { type: String },
    raw: { type: Object }, // full payload from Pi for debugging/audit
  },
  { timestamps: true }
);

export default mongoose.models.PiPayment || mongoose.model('PiPayment', PiPaymentSchema);
