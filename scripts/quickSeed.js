require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// MongoDB connection
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

const competitions = [
  {
    comp: {
      slug: '55-inch-tv-giveaway',
      entryFee: 0.45,
      totalTickets: 1500,
      ticketsSold: 0,
      startsAt: '2025-06-16T11:30:00Z',
      endsAt: '2025-08-16T11:30:00Z',
      paymentType: 'pi',
      piAmount: 0.45,
      status: 'active'
    },
    title: '55″ Smart TV',
    prize: '55″ Smart TV',
    href: '/competitions/55-inch-tv-giveaway',
    imageUrl: '/images/tv.jpg',
    theme: 'tech'
  },
  {
    comp: {
      slug: 'xbox-one-bundle',
      entryFee: 0.35,
      totalTickets: 1300,
      ticketsSold: 0,
      startsAt: '2025-06-12T17:45:00Z',
      endsAt: '2025-08-12T17:45:00Z',
      paymentType: 'pi',
      piAmount: 0.35,
      status: 'active'
    },
    title: 'Xbox One',
    prize: 'Xbox One + Game Pass',
    href: '/competitions/xbox-one-bundle',
    imageUrl: '/images/xbox.jpeg',
    theme: 'tech'
  },
  {
    comp: {
      slug: 'nintendo-switch',
      entryFee: 0.36,
      totalTickets: 1830,
      ticketsSold: 0,
      startsAt: '2025-06-09T13:30:00Z',
      endsAt: '2025-08-09T13:30:00Z',
      paymentType: 'pi',
      piAmount: 0.36,
      status: 'active'
    },
    title: 'Nintendo Switch',
    prize: 'Nintendo Switch',
    href: '/competitions/nintendo-switch',
    imageUrl: '/images/nintendo.png',
    theme: 'tech'
  },
  {
    comp: {
      slug: 'apple-airpods',
      entryFee: 0.30,
      totalTickets: 1665,
      ticketsSold: 0,
      startsAt: '2025-06-12T13:30:00Z',
      endsAt: '2025-08-12T13:30:00Z',
      paymentType: 'pi',
      piAmount: 0.30,
      status: 'active'
    },
    title: 'Apple AirPods',
    prize: 'Apple AirPods',
    href: '/competitions/apple-airpods',
    imageUrl: '/images/airpods.png',
    theme: 'tech'
  },
  {
    comp: {
      slug: 'dubai-luxury-holiday',
      entryFee: 2.5,
      totalTickets: 4000,
      ticketsSold: 0,
      startsAt: '2025-06-15T22:00:00Z',
      endsAt: '2025-08-15T22:00:00Z',
      paymentType: 'pi',
      piAmount: 2.5,
      status: 'active'
    },
    title: 'Dubai Luxury Holiday',
    prize: '7-Day Dubai Trip',
    href: '/competitions/dubai-luxury-holiday',
    imageUrl: '/images/dubai-luxury-holiday.jpg',
    theme: 'premium'
  },
  {
    comp: {
      slug: 'pi-giveaway-10k',
      entryFee: 2.2,
      totalTickets: 5200,
      ticketsSold: 0,
      startsAt: '2025-06-15T00:00:00Z',
      endsAt: '2025-08-31T00:00:00Z',
      paymentType: 'pi',
      piAmount: 2.2,
      status: 'active'
    },
    title: '10,000 Pi',
    prize: '10,000 π',
    href: '/competitions/pi-giveaway-10k',
    imageUrl: '/images/bitcoin.png',
    theme: 'pi'
  },
  {
    comp: {
      slug: 'daily-jackpot',
      entryFee: 0,
      totalTickets: 1820,
      ticketsSold: 0,
      startsAt: '2025-06-26T00:00:00Z',
      endsAt: '2025-06-27T23:59:00Z',
      paymentType: 'free',
      piAmount: 0,
      status: 'active'
    },
    title: 'Daily Jackpot',
    prize: '750 π',
    href: '/competitions/daily-jackpot',
    imageUrl: '/images/daily.png',
    theme: 'daily'
  }
];

async function seedCompetitions() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔄 Seeding competitions...');
    for (const comp of competitions) {
      const result = await Competition.findOneAndUpdate(
        { 'comp.slug': comp.comp.slug },
        comp,
        { upsert: true, new: true }
      );
      console.log(`✅ Seeded: ${comp.title} (${comp.comp.slug})`);
    }

    console.log(`🎉 Successfully seeded ${competitions.length} competitions!`);
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding competitions:', error);
    process.exit(1);
  }
}

seedCompetitions(); 