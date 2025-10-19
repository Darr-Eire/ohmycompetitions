import mongoose from 'mongoose';

const MysteryBoxSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  priceInPi: { type: Number, required: true },
  rewards: [{
    name: { type: String, required: true },
    value: { type: String }, // e.g., "0.01 Pi", "5 Pi Competition Ticket"
    chance: { type: Number, required: true, min: 0, max: 1 } // Probability as decimal
  }],
  imageUrl: { type: String },
  themeColor: { type: String },
  isActive: { type: Boolean, default: true },
  description: { type: String },
  rarity: { 
    type: String, 
    enum: ['bronze', 'silver', 'gold', 'platinum'], 
    default: 'bronze' 
  }
}, {
  timestamps: true
});

// Index for efficient queries
MysteryBoxSchema.index({ id: 1 });
MysteryBoxSchema.index({ isActive: 1 });
MysteryBoxSchema.index({ rarity: 1 });

export default mongoose.models.MysteryBox || mongoose.model('MysteryBox', MysteryBoxSchema); 