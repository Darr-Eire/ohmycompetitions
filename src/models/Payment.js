import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  competitionId: String,
  userId: String,
  amount: Number,
  piTxId: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
