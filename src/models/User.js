// src/models/User.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const XpHistorySchema = new Schema(
  {
    amount: { type: Number, required: true },
    reason: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    // Pi & auth
    piUserId: { type: String, required: false, unique: true, sparse: true }, // Pi SDK user id
    username: { type: String, required: true, trim: true },
    email: { type: String, sparse: true, trim: true }, // unique via partial index
    password: { type: String }, // (only for admin/credentials flow)
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // Profile
    country: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    bio: { type: String, default: '' },
    birthdate: { type: Date },
    locale: { type: String, default: 'en' }, // for multi-language UX

    // Social links
    social: {
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      tiktok: { type: String, default: '' },
    },

    /* ---------------------------- Referral system ---------------------------- */
    // Public referral code (unique when set)
    referralCode: { type: String, trim: true, unique: true, sparse: true },
    // New canonical field: who referred me (User._id)
    referrerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },

    // Legacy string (if you already stored something like a code or username)
    // Keep it around for migration; otherwise you can remove later.
    referredBy: { type: String, default: '' },

    // Referral stats
    referralCount: { type: Number, default: 0 },        // lifetime qualified referrals
    referralWeeklyCount: { type: Number, default: 0 },  // resets weekly (for caps)
    referralBadges: [{ type: String }],                 // e.g., ["Top Referrer"]

    // Anti-abuse helper (optional device fingerprint hash)
    lastDeviceHash: { type: String, default: '' },

    // Rewards from referrals (tickets you grant elsewhere; this is a quick counter if you want it)
    bonusTickets: { type: Number, default: 0 },

    /* ---------------------------- Ticket governance --------------------------- */
    // Per-user default cap (used if competition cap not set)
    maxTicketsDefault: { type: Number, default: 50 },
    // Optional per-competition override: { [competitionId]: capNumber }
    maxTicketsOverrides: { type: Map, of: Number, default: {} },

    // Gifting counters (nice for showing stats)
    giftedTicketsCount: { type: Number, default: 0 },
    receivedTicketsCount: { type: Number, default: 0 },

    /* ---------------------------- Gamification: XP ---------------------------- */
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    xpHistory: [XpHistorySchema],
  },
  { timestamps: true }
);

/* --------------------------------- Indexes --------------------------------- */

// Unique email only when set (partial unique)
UserSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
);

// Unique referralCode only when set (partial unique)
UserSchema.index(
  { referralCode: 1 },
  { unique: true, partialFilterExpression: { referralCode: { $type: 'string' } } }
);

// piUserId already has unique+sparse on the field definition; ensure an index exists
UserSchema.index({ piUserId: 1 }, { unique: true, sparse: true });

// Useful lookups
UserSchema.index({ country: 1 });
UserSchema.index({ locale: 1 });
UserSchema.index({ referralWeeklyCount: 1 }); // helps weekly leaderboard/cap jobs

/* ------------------------------ Virtual helpers ----------------------------- */
// (Optional) Full display name fallback
UserSchema.virtual('displayName').get(function () {
  return this.username || (this.email ? this.email.split('@')[0] : 'Pioneer');
});

/* ----------------------------- Model export safe ---------------------------- */
export default mongoose.models.User || mongoose.model('User', UserSchema);
