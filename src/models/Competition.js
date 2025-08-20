// src/models/Competition.js
import mongoose from 'mongoose';

function arrayLimit(val) {
  return Array.isArray(val) && val.length <= 10;
}

const CompetitionSchema = new mongoose.Schema(
  {
    comp: {
      slug: { type: String, required: true, unique: true, index: true },
      entryFee: { type: Number, required: true },
      totalTickets: { type: Number, required: true },
      ticketsSold: { type: Number, default: 0 },
      prizePool: { type: Number, default: 0 },
      startsAt: String,
      endsAt: String,
      location: String,
      paymentType: { type: String, enum: ['pi', 'free'], default: 'pi' },
      piAmount: { type: Number, required: true },
      status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },

      // admin form values
      maxPerUser: { type: Number, min: 1, required: true },
      winnersCount: { type: Number, min: 1, required: true },
    },

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

    winners: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        ticketNumber: Number,
        claimed: { type: Boolean, default: false },
        claimedAt: Date,
      },
    ],

    payments: [
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
    ],
  },
  { timestamps: true }
);

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
          $gte: [
            { $subtract: ['$comp.totalTickets', '$comp.ticketsSold'] },
            qty,
          ],
        },
      },
      { $inc: { 'comp.ticketsSold': qty } },
      { new: true }
    );

    if (!updated) {
      // Tell caller whether it’s missing or sold out
      const current = await this.findOne({ 'comp.slug': slug }).select('comp.totalTickets comp.ticketsSold');
      if (!current) throw new Error('Competition not found');
      const avail = (current.comp.totalTickets ?? 0) - (current.comp.ticketsSold ?? 0);
      throw new Error(`Not enough tickets available. Requested ${qty}, available ${Math.max(0, avail)}`);
    }

    const start = (updated.comp.ticketsSold ?? 0) - qty + 1;
    const ticketNumbers = Array.from({ length: qty }, (_, i) => `T${start + i}`);

    return { updated, ticketNumbers };
  };

  return Model;
}

const Competition =
  mongoose.models.Competition || mongoose.model('Competition', CompetitionSchema);

attachStatics(Competition);

export default Competition;
