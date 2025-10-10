import mongoose from 'mongoose';

const CompetitionSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: String,
    stage: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['filling', 'live', 'complete', 'paused'],
      default: 'filling'
    },
    entrantsCount: { type: Number, default: 0 },
    capacity: { type: Number, default: 25 },
    advancing: { type: Number, default: 5 },
    imageUrl: String
  },
  { timestamps: true }
);

export default mongoose.models.Competition ||
  mongoose.model('Competition', CompetitionSchema);
