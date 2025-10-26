import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema(
  {
    // Canonical user identity
    userUid: { type: String, index: true, required: true },
    username: { type: String, required: true },

    // Competition identity
    competitionSlug: { type: String, required: true, index: true },
    competitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', index: true },
    competitionTitle: { type: String, required: true },

    // Purchase payload
    imageUrl: { type: String },
    quantity: { type: Number, default: 1 },
    ticketNumbers: { type: [String], default: [] },
    purchasedAt: { type: Date, default: Date.now },

    // Gifting
    gifted: { type: Boolean, default: false },
    giftedBy: { type: String, default: null },

    source: { type: String, default: 'purchase' }, // purchase | admin-grant | voucher | free

    // Payment linkage & metadata
    meta: {
      paymentId: { type: String, index: true }, // unique via compound index below
      txidHint: { type: String },
      piUserUid: { type: String },
    },

    // ✅ REQUIRED skill question block
    skillQuestion: {
      questionId: { type: String, required: true },
      question: { type: String, required: true },
      answers: { type: [String], required: true },
      correctAnswer: { type: String, required: true },
      userAnswer: { type: String, required: true },
      isCorrect: { type: Boolean, required: true },
      difficulty: { type: String, default: 'easy' },
      tags: { type: [String], default: [] },
      attemptedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

// 🔧 Helpful indexes
// Fast lookups and per-competition/user caps
TicketSchema.index({ userUid: 1, competitionSlug: 1 });
// Enforce idempotency: one ticket record per paymentId (sparse so null/undefined allowed)
TicketSchema.index({ 'meta.paymentId': 1 }, { unique: true, sparse: true });

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
