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

    ticketPrizes: [{
      competitionSlug: { type: String, required: true },
      ticketCount: { type: Number, required: true, min: 1 },
      position: { type: Number, min: 1 },
    }],

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

async function reserveTicketsImpl(slug, qty) {
  qty = Number(qty) || 0;
  if (qty <= 0) throw new Error('Invalid quantity');

  const Model = this;

  // Single atomic attempt using $expr and $toDouble, first for comp.*, then for root fields.
  const tryAtomic = async () => {
    // 1) comp.* (nested) path
    let updated = await Model.findOneAndUpdate(
      {
        'comp.slug': slug,
        $expr: {
          $gte: [
            {
              $subtract: [
                { $toDouble: { $ifNull: ['$comp.totalTickets', 0] } },
                { $toDouble: { $ifNull: ['$comp.ticketsSold', 0] } },
              ],
            },
            qty,
          ],
        },
      },
      { $inc: { 'comp.ticketsSold': qty } },
      { new: true, lean: true }
    );

    // 2) fallback root (legacy) path
    if (!updated) {
      updated = await Model.findOneAndUpdate(
        {
          slug,
          $expr: {
            $gte: [
              {
                $subtract: [
                  { $toDouble: { $ifNull: ['$totalTickets', 0] } },
                  { $toDouble: { $ifNull: ['$ticketsSold', 0] } },
                ],
              },
              qty,
            ],
          },
        },
        { $inc: { ticketsSold: qty } },
        { new: true, lean: true }
      );
    }

    return updated;
  };

  const updated = await tryAtomic();

  if (!updated) {
    // Inspect the doc to return a clear message
    const current =
      (await Model.findOne({ 'comp.slug': slug }).lean()) ||
      (await Model.findOne({ slug }).lean());

    if (!current) throw new Error('Competition not found');

    const total = Number(current.comp?.totalTickets ?? current.totalTickets ?? 0) || 0;
    const sold  = Number(current.comp?.ticketsSold  ?? current.ticketsSold  ?? 0) || 0;
    const avail = Math.max(0, total - sold);

    throw new Error(`Not enough tickets available. Requested ${qty}, available ${avail}`);
  }

  const soldNow = Number(updated.comp?.ticketsSold ?? updated.ticketsSold ?? 0) || 0;
  const start   = soldNow - qty + 1;
  const ticketNumbers = Array.from({ length: qty }, (_, i) => `T${start + i}`);

  return { updated, ticketNumbers };
}


// Attach on schema (for fresh model compiles)
CompetitionSchema.statics.reserveTickets = reserveTicketsImpl;

// Create or reuse the model
const Competition = mongoose.models.Competition || mongoose.model('Competition', CompetitionSchema);

// If model already existed (compiled earlier), ensure the static is present
if (!Competition.reserveTickets) {
  Competition.reserveTickets = reserveTicketsImpl.bind(Competition);
}

export default Competition;
