// models/Competition.js
import mongoose from 'mongoose';

const CompetitionSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  prize: String,
  entryFee: Number,
  imageUrl: String,
  date: String,
  time: String,
  location: String,
  endsAt: Date,
  totalTickets: Number,
});

const Competition = mongoose.models.Competition || mongoose.model('Competition', CompetitionSchema);

export default Competition;
