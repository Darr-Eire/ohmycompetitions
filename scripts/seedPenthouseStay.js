const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_DB_URL;

if (!MONGO_URI) {
  console.error('❌ Missing MONGO_DB_URL in environment');
  process.exit(1);
}

// Competition schema (inline for this script)
const competitionSchema = new mongoose.Schema({
  comp: {
    slug: { type: String, required: true, unique: true },
    entryFee: { type: Number, required: true },
    totalTickets: { type: Number, required: true },
    ticketsSold: { type: Number, default: 0 },
    startsAt: String,
    endsAt: String,
    paymentType: { type: String, enum: ['pi', 'free'], default: 'pi' },
    piAmount: { type: Number, required: true },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' }
  },
  title: { type: String, required: true },
  prize: { type: String, required: true },
  href: String,
  theme: { type: String, required: true },
  imageUrl: String
}, { timestamps: true });

const Competition = mongoose.models.Competition || mongoose.model('Competition', competitionSchema);

const penthouseCompetition = {
  comp: {
    slug: 'penthouse-stay',
    entryFee: 0.75,
    totalTickets: 3000,
    ticketsSold: 0,
    startsAt: '2025-06-20T21:00:00Z',
    endsAt: '2025-08-20T21:00:00Z',
    paymentType: 'pi',
    piAmount: 0.75,
    status: 'active'
  },
  title: 'Penthouse Stay',
  prize: 'Penthouse Hotel Stay of your choice',
  href: '/competitions/penthouse-stay',
  imageUrl: '/images/hotel.jpeg',
  theme: 'premium'
};

async function seed() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    console.log('🔄 Adding penthouse-stay competition...');
    const result = await Competition.findOneAndUpdate(
      { 'comp.slug': penthouseCompetition.comp.slug },
      penthouseCompetition,
      { upsert: true, new: true }
    );

    console.log('✅ Penthouse Stay Competition Added:', {
      slug: result.comp.slug,
      title: result.title,
      entryFee: result.comp.entryFee,
      totalTickets: result.comp.totalTickets,
      status: result.comp.status
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding penthouse competition:', err);
    process.exit(1);
  }
}

seed(); 