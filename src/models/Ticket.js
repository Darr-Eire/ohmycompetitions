// /models/Ticket.js
import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  username: { type: String, required: true },               // Recipient of the ticket
  competitionSlug: { type: String, required: true },
  competitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition' }, // Reference to competition
  competitionTitle: { type: String, required: true },
  imageUrl: { type: String },
  quantity: { type: Number, default: 1 },
  ticketNumbers: { type: [String], default: [] },
  purchasedAt: { type: Date, default: Date.now },
  gifted: { type: Boolean, default: false },
  giftedBy: { type: String, default: null },                // Optional: who gifted it
});

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
