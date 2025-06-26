// src/models/Competition.js

import mongoose from 'mongoose';

const CompetitionSchema = new mongoose.Schema({
  comp: {
    slug: { type: String, required: true, unique: true },
    entryFee: { type: Number, required: true },
    totalTickets: { type: Number, required: true },
    ticketsSold: { type: Number, default: 0 },
    prizePool: { type: Number, default: 0 }, // 50% of ticket sales goes to prize pool
    startsAt: String,
    endsAt: String,
    location: String,
    paymentType: { type: String, enum: ['pi', 'free'], default: 'pi' },
    piAmount: { type: Number, required: true }, // Amount in Pi
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' }
  },
  title: { type: String, required: true },
  prize: { type: String, required: true },
  href: String,
  theme: { type: String, required: true },
  imageUrl: String,
  winners: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    ticketNumber: Number,
    claimed: { type: Boolean, default: false },
    claimedAt: Date
  }],
  payments: [{
    paymentId: String,
    txid: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    amount: Number,
    status: { type: String, enum: ['pending', 'completed', 'cancelled', 'failed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    completedAt: Date
  }]
}, {
  timestamps: true
});

export default mongoose.models.Competition || mongoose.model('Competition', CompetitionSchema);
