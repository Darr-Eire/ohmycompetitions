// src/models/User.js

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },

    // Roles (admin, user, etc.)
    role: { type: String, default: 'user' },

    // Basic profile fields
    name: { type: String },
    country: { type: String },

    // Profile customization
    profileImage: { type: String },  // URL for uploaded avatar
    flag: { type: String },          // For selected flag if needed

    bio: { type: String },
    birthdate: { type: Date },

    // Social media handles
    social: {
      twitter: { type: String },
      instagram: { type: String },
      facebook: { type: String },
      tiktok: { type: String },
    },
  },
  { timestamps: true }
);

// Export model (avoid model overwrite in hot reload)
export default mongoose.models.User || mongoose.model('User', UserSchema);
