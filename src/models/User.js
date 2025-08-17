import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    piUserId: { type: String, required: false, unique: true, sparse: true }, // Pi SDK user id
    username: { type: String, required: true },
    email: { type: String, sparse: true }, // remove unique constraint, handle with partial index
    password: { type: String }, // Admin password (for NextAuth CredentialsProvider only)
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // Account info
    country: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    bio: { type: String, default: '' },
    birthdate: { type: Date },

    // Social links
    social: {
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      tiktok: { type: String, default: '' },
    },

    // Referral system
    referralCode: { type: String, unique: true }, // partial index handles uniqueness only when set
    referredBy: { type: String, default: '' },
    bonusTickets: { type: Number, default: 0 },

    // 🚀 Gamification: XP + Levels
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    xpHistory: [
      {
        amount: { type: Number, required: true },
        reason: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// ✅ Indexes
// Unique email but only if set
UserSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
);

// Unique referralCode but only if set
UserSchema.index(
  { referralCode: 1 },
  { unique: true, partialFilterExpression: { referralCode: { $type: 'string' } } }
);

// ✅ Prevent model overwrite errors in Next.js (hot reload fix)
export default mongoose.models.User || mongoose.model('User', UserSchema);
