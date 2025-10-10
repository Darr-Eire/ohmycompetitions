import mongoose from 'mongoose';

const PioneerNominationSchema = new mongoose.Schema({
  name: String,
  reason: String,
  votes: { type: Number, default: 0 },
  voters: [{ 
    type: String // Store user UIDs who have voted
  }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.PioneerNomination ||
  mongoose.model('PioneerNomination', PioneerNominationSchema);
