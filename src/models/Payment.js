import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },     // from Pi SDK
  txid: { type: String },                          // from onReadyForServerCompletion
  uid: { type: String, required: true },           // Pi user ID
  competitionSlug: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'PENDING' },    // PENDING | COMPLETED | CANCELLED | ERROR
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
