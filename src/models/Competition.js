// src/models/Competition.js
import mongoose from 'mongoose';

function arrayLimit(val) {
  return Array.isArray(val) && val.length <= 10;
}

const PaymentSchema = new mongoose.Schema(
  {
    paymentId: String,
    txid: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'failed'],
      default: 'pending',
    },
    createdAt: { type: Date, default: Date.now },
    completedAt: Date,
  },
  { _id: false }
);

const WinnerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    ticketNumber: Number,
    claimed: { type: Boolean, default: false },
    claimedAt: Date,
  },
  { _id: false }
);

const CompInnerSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    entryFee: { type: Number, required: true },
    totalTickets: { type: Number, required: true },
    ticketsSold: { type: Number, default: 0 },
    prizePool: { type: Number, default: 0 },

    // Keep as string to avoid breaking existing docs
    startsAt: String,
    endsAt: String,

    location: String,
    paymentType: { type: String, enum: ['pi', 'free'], default: 'pi' },
    piAmount: { type: Number, required: true },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active', index: true },

    // Admin form values
    maxPerUser: { type: Number, min: 1, required: true },
    winnersCount: { type: Number, min: 1, required: true },
  },
  { _id: false }
);

const CompetitionSchema = new mongoose.Schema(
  {
    comp: { type: CompInnerSchema, required: true },

    title: { type: String, required: true },
    description: { type: String },

    prizeBreakdown: {
      type: [String],
      default: [],
      validate: [arrayLimit, '{PATH} exceeds the limit of 10'],
    },

    prize: { type: String, required: true },

    href: String,
    theme: { type: String, required: true },
    imageUrl: String,
    thumbnail: String,

    winners: { type: [WinnerSchema], default: [] },

    payments: { type: [PaymentSchema], default: [] },
  },
  { timestamps: true }
);

// Helpful compound index for queries that sort by time and filter by status
CompetitionSchema.index({ 'comp.status': 1, createdAt: -1 });

// ---- attach statics (works even with HMR cache) ----
function attachStatics(Model) {
  if (Model.reserveTickets) return Model;

  /**
   * Atomically reserve `qty` tickets for a competition identified by `slug`.
   * - Increments comp.ticketsSold only if enough inventory is available.
   * - Returns the updated document and the issued ticket numbers like T12..T15.
   */
  Model.reserveTickets = async function reserveTickets(slug, qty) {
    qty = Number(qty) || 0;
    if (qty <= 0) throw new Error('Invalid quantity');

    // Atomic check: available >= qty
    const updated = await this.findOneAndUpdate(
      {
        'comp.slug': slug,
        $expr: {
          $gte: [{ $subtract: ['$comp.totalTickets', '$comp.ticketsSold'] }, qty],
        },
      },
      { $inc: { 'comp.ticketsSold': qty } },
      { new: true }
    );

    if (!updated) {
      // Tell caller whether it’s missing or sold out
      const current = await this.findOne({ 'comp.slug': slug }).select(
        'comp.totalTickets comp.ticketsSold'
      );
      if (!current) throw new Error('Competition not found');
      const avail =
        (current.comp.totalTickets ?? 0) - (current.comp.ticketsSold ?? 0);
      throw new Error(
        `Not enough tickets available. Requested ${qty}, available ${Math.max(0, avail)}`
      );
    }

    const start = (updated.comp.ticketsSold ?? 0) - qty + 1;
    const ticketNumbers = Array.from({ length: qty }, (_, i) => `T${start + i}`);

    return { updated, ticketNumbers };
  };

  /**
   * Check whether a user can buy `qty` more tickets for the comp (maxPerUser guard).
   * Evaluates against completed payments in this document.
   */
  Model.canUserBuy = async function canUserBuy(slug, userId, qty = 1) {
    const doc = await this.findOne({ 'comp.slug': slug }).lean();
    if (!doc) throw new Error('Competition not found');

    const limit = doc.comp?.maxPerUser ?? 1;
    const current = (doc.payments || []).filter(
      p =>
        String(p.userId) === String(userId) &&
        p.status === 'completed'
    ).length;

    const allowed = current + qty <= limit;
    return { allowed, current, limit };
  };

  return Model;
}

const Competition =
  mongoose.models.Competition || mongoose.model('Competition', CompetitionSchema);

attachStatics(Competition);

export default Competition;
