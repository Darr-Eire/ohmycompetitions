import mongoose from 'mongoose';

const PioneerNominationSchema = new mongoose.Schema({
  name: String,
  reason: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.PioneerNomination ||
  mongoose.model('PioneerNomination', PioneerNominationSchema);
