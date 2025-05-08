import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  uid: { type: String, unique: true, required: true },
  name: String,
  email: String,
  streak: { type: Number, default: 0 },

  // Daily usage tracking
  lastSpinAt: Date,
  lastReflexAt: Date,  // 3.14 Seconds
  lastSlotAt: Date,    // Pi Slot Machine
  lastVaultAt: Date,   // Hack the Vault

  // Optional: Fallback/general game usage
  lastGameAt: Date,
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
