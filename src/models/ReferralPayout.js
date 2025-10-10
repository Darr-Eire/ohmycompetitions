// src/models/ReferralPayout.js
const ReferralPayoutSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  refereeId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  rewards: [{ type: String }], // compact log e.g., ["ticket:1","xp:50","milestone:5"]
  weekKey: String,             // e.g., "2025-W35" to enforce weekly caps
}, { timestamps: true });
