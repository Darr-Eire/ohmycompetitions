import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    piUserId: { type: String, required: false, unique: true, sparse: true },  // Pi SDK user id
    username: { type: String, required: true },
    email: { type: String, sparse: true },  // Remove unique constraint, will handle with custom index
    password: { type: String },  // Admin password (only for NextAuth CredentialsProvider)
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
    referralCode: { type: String, unique: true }, // Remove sparse, will use partial index
    referredBy: { type: String, default: '' },
    bonusTickets: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Create a partial unique index on email that only applies when email is not null
UserSchema.index({ email: 1 }, { 
  unique: true,
  partialFilterExpression: { email: { $type: "string" } }
});

// Create a partial unique index on referralCode that only applies when referralCode is not null
UserSchema.index({ referralCode: 1 }, {
  unique: true,
  partialFilterExpression: { referralCode: { $type: "string" } }
});

// ✅ Prevent model overwrite errors
export default mongoose.models.User || mongoose.model('User', UserSchema);
