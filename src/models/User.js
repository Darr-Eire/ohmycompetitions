import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    piUserId: { type: String, required: false }, // ✅ optional now
    username: { type: String, required: true },
    email: { type: String },
    password: { type: String }, // ✅ admin login case
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    country: { type: String, default: '' },
    profileImage: { type: String, default: '' },
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
