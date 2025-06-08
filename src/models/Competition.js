import mongoose from 'mongoose';

const CompetitionSchema = new mongoose.Schema({
  comp: {
    slug: { type: String, required: true, unique: true },
    entryFee: { type: Number, required: true },
    totalTickets: { type: Number, required: true },
    ticketsSold: { type: Number, default: 0 },
    startsAt: String,
    endsAt: String,
    location: String
  },
  title: { type: String, required: true },
  prize: { type: String, required: true },
  href: String,
  theme: { type: String, required: true }
});

export default mongoose.models.Competition || mongoose.model('Competition', CompetitionSchema);
