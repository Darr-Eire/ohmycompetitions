import mongoose from 'mongoose';

const CountrySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  region: { type: String }, // e.g., 'Europe', 'Africa', 'Asia'
  piNetworkPopular: { type: Boolean, default: false }, // Mark countries with high Pi Network usage
  flagUrl: { type: String }, // URL to flag image
  sortOrder: { type: Number, default: 0 } // For custom ordering
}, {
  timestamps: true
});

// Indexes for efficient queries
CountrySchema.index({ code: 1 });
CountrySchema.index({ isActive: 1 });
CountrySchema.index({ piNetworkPopular: 1 });
CountrySchema.index({ region: 1 });
CountrySchema.index({ sortOrder: 1 });

export default mongoose.models.Country || mongoose.model('Country', CountrySchema); 