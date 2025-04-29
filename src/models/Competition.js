import mongoose from 'mongoose'

const CompetitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  prize: { type: String, required: true },
  totalTickets: { type: Number, required: true },
  ticketsSold: { type: Number, default: 0 },
  endsAt: { type: Date, required: true },
  image: { type: String, required: true },
  fee: { type: Number, required: true },
  slug: { type: String, required: true, unique: true },
}, { timestamps: true })

export default mongoose.models.Competition || mongoose.model('Competition', CompetitionSchema)
