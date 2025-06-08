// src/models/User.js

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    piUserId: { type: String, required: true, unique: true }, // Pi Network UID
    username: { type: String, required: true }, // Pi username
    country: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    bio: { type: String, default: '' },
    birthdate: { type: Date },

    social: {
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      tiktok: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
