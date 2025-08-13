// src/models/Competition.js
import mongoose from 'mongoose';

function arrayLimit(val) {
  return Array.isArray(val) && val.length <= 10;
}

const CompetitionSchema = new mongoose.Schema({
  comp: {
    slug: { type: String, required: true, unique: true },
    entryFee: { type: Number, required: true },
    totalTickets: { type: Number, required: true },
    ticketsSold: { type: Number, default: 0 },
    prizePool: { type: Number, default: 0 },
    startsAt: String, // keep as String if your API stores strings
    endsAt: String,
    location: String,
    paymentType: { type: String, enum: ['pi', 'free'], default: 'pi' },
    piAmount: { type: Number, required: true },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },

    // Real values from admin form
    maxPerUser: { type: Number, min: 1, required: true },
  winnersCount: { type: Number, min: 1, required: true },
  },

  title: { type: String, required: true },
  description: { type: String },

  // Single array for multiple prize lines
  prizeBreakdown: {
    type: [String],
    default: [],
    validate: [arrayLimit, '{PATH} exceeds the limit of 10'],
  },

  // Optional legacy single prize text
  prize: { type: String, required: true },

  href: String,
  theme: { type: String, required: true },
  imageUrl: String,
  thumbnail: String,

  winners: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    ticketNumber: Number,
    claimed: { type: Boolean, default: false },
    claimedAt: Date,
  }],

  payments: [{
    paymentId: String,
    txid: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    amount: Number,
    status: { type: String, enum: ['pending', 'completed', 'cancelled', 'failed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    completedAt: Date,
  }],
}, { timestamps: true });

export default mongoose.models.Competition || mongoose.model('Competition', CompetitionSchema);
