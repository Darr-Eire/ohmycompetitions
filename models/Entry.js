import mongoose from 'mongoose';

const EntrySchema = new mongoose.Schema({
  competitionId: String,
  userId: String,
  timestamp: Date,
  entryHash: String
});

export default mongoose.models.Entry || mongoose.model('Entry', EntrySchema);
