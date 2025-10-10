import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    fromStage: { type: Number, required: true, index: true },
    toStage: { type: Number, required: true, index: true },
    cycleId: { type: String, index: true },
    consumed: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

schema.index({ toStage: 1, consumed: 1, createdAt: 1 });

export default mongoose.models.FunnelAdvance ||
  mongoose.model('FunnelAdvance', schema);
