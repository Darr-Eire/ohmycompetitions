// src/models/FunnelCompetition.js
import mongoose from 'mongoose';

const FunnelCompetitionSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    stage: { type: Number, required: true, default: 1, index: true },
    capacity: { type: Number, default: 25 },
    advancing: { type: Number, default: 5 },
    status: { type: String, enum: ['filling', 'live', 'done'], default: 'filling', index: true },
    entrantsCount: { type: Number, default: 0 },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    imageUrl: { type: String, default: null },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.FunnelCompetition ||
  mongoose.model('FunnelCompetition', FunnelCompetitionSchema);
