import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  uid: { type: String, required: true },
  txid: { type: String },
  amount: { type: Number, required: true },
  competitionSlug: { type: String },
  status: { type: String, default: 'PENDING' }, // PENDING | COMPLETED | CANCELLED
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
