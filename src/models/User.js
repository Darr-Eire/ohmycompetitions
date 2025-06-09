import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    piUserId: { type: String, required: false, unique: true, sparse: true }, // Allow Pi or non-Pi users
    username: { type: String, required: true },
    email: { type: String },
    password: { type: String }, // Admin password (for credentials provider)
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
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String, default: '' },
    bonusTickets: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent model overwrite errors
export default mongoose.models.User || mongoose.model('User', UserSchema);
