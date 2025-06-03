import mongoose from 'mongoose';

const CompetitionSchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
  ipfsHash: String,
  prize: Number,
  status: { type: String, default: 'OPEN' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Competition || mongoose.model('Competition', CompetitionSchema);
