// models/Competition.js
import mongoose from 'mongoose';

const CompetitionSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  description: String,
  prize: String,
  entryFee: Number,
  imageUrl: String,
  date: String,
  time: String,
  location: String,
  endsAt: Date,
  totalTickets: { type: Number, default: 100 },
  ticketsSold: { type: Number, default: 0 },

  // Add type field for sponsored vs regular
  type: { type: String, enum: ['regular', 'sponsored'], default: 'regular' },

  // Sponsored fields
  partnerName: String,
  partnerLogoUrl: String,
  partnerWebsite: String,

  createdAt: { type: Date, default: Date.now }
});

const Competition = mongoose.models.Competition || mongoose.model('Competition', CompetitionSchema);

export default Competition;
