// file: src/models/FunnelCompetition.js
import mongoose from 'mongoose';

const EntrantSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  score: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
});

const FunnelCompetitionSchema = new mongoose.Schema({
  slug: { type: String, unique: true, index: true },
  stage: { type: Number, required: true, index: true },
  status: { type: String, enum: ['filling', 'live', 'done'], default: 'filling', index: true },
  capacity: { type: Number, default: 25 },
  advancing: { type: Number, default: 5 },
  entrants: [EntrantSchema],
  entrantsCount: { type: Number, default: 0, index: true },
  cycleId: { type: String, index: true, default: 'default' },
  createdAt: { type: Date, default: Date.now, index: true },
  startedAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.FunnelCompetition
  || mongoose.model('FunnelCompetition', FunnelCompetitionSchema);
