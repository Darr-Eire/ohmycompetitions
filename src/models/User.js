import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    // Pi Network
    piUserId: { type: String, required: false, unique: true, sparse: true }, // Pi SDK user id
    username: { type: String, required: true },

    // Optional email/password for admin or email-based login
    email: { type: String, unique: true, sparse: true },
    password: { type: String },

    // Role-based access
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // Optional profile info
    country: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    bio: { type: String, default: '' },
    birthdate: { type: Date },

    // Socials
    social: {
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      tiktok: { type: String, default: '' },
    },

    // Referrals
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String, default: '' },
    bonusTickets: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Prevents model recompile on hot reload
export default mongoose.models.User || mongoose.model('User', UserSchema);
