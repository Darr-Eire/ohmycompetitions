import mongoose from 'mongoose';

const EntrantSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    score: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const FunnelCompetitionSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    cycleId: { type: String },

    stage: { type: Number, required: true, default: 1 },
    status: {
      type: String,
      enum: ['filling', 'live', 'ended', 'complete', 'paused'],
      default: 'filling',
      index: true,
    },

    capacity: { type: Number, default: 25 },
    advancing: { type: Number, default: 5 },

    entrants: { type: [EntrantSchema], default: [] },
    entrantsCount: { type: Number, default: 0 },

    winners: { type: [String], default: [] },

    imageUrl: { type: String },

    startsAt: { type: Date },
    endsAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.FunnelCompetition
  || mongoose.model('FunnelCompetition', FunnelCompetitionSchema);
