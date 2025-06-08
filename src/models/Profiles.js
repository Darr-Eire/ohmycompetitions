import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String },
  country: { type: String },
  flag: { type: String },
}, { timestamps: true });

export default mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
