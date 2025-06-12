import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  competitionTitle: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
  ticketNumbers: [
    {
      type: String,
    },
  ],
});

// ✅ Prevent model overwrite in dev or hot-reload environments
export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
