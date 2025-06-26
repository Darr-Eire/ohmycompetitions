import mongoose from 'mongoose';

const ReferralSchema = new mongoose.Schema({
  username: { type: String, required: true },
  compSlug: { type: String, required: true },
  referrer: { type: String, default: null },
  claimedAt: { type: Date, default: Date.now },
  referrals: { type: Number, default: 0 },
});

export default mongoose.models.Referral || mongoose.model('Referral', ReferralSchema);
