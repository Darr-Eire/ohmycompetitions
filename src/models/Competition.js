import mongoose from 'mongoose';

const competitionSchema = new mongoose.Schema({
  slug: String,
  title: String,
  prize: String,
  entryFee: Number,
  imageUrl: String,
  date: String,
  time: String,
  location: String,
  endsAt: Date,
  totalTickets: Number,
  ticketsSold: Number,
});

const Competition = mongoose.models.Competition || mongoose.model('Competition', competitionSchema);

export default Competition;
