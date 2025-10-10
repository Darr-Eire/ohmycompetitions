// /src/models/Ticket.js  (or wherever your Ticket model lives)
import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  username: { type: String, required: true },
  competitionSlug: { type: String, required: true },
  competitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition' },
  competitionTitle: { type: String, required: true },
  imageUrl: { type: String },
  quantity: { type: Number, default: 1 },
  ticketNumbers: { type: [String], default: [] },
  purchasedAt: { type: Date, default: Date.now },
  gifted: { type: Boolean, default: false },
  giftedBy: { type: String, default: null },

  // 🔹 add this block
  meta: {
    paymentId: { type: String, index: true }, // lets us find tickets by payment
    txidHint: { type: String },
    piUserUid: { type: String },
  },

  // Skill question data
  skillQuestion: {
    questionId: { type: String, required: true },
    question: { type: String, required: true },
    answers: { type: [String], required: true },
    correctAnswer: { type: String, required: true },
    userAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    difficulty: { type: String, default: 'easy' },
    tags: { type: [String], default: [] },
    attemptedAt: { type: Date, default: Date.now }
  }
});

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
