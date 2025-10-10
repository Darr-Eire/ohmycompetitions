import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGO_DB_URL;

if (!MONGODB_URI) {
  throw new Error('Please define MONGO_DB_URL in .env.local');
}

const piCompetitions = [
  {
    comp: {
      title: '10,000 Pi Giveaway',
      prize: '10,000 π',
      piAmount: 2.2,
      date: 'June 28, 2025',
      time: '12:00 AM UTC',
      endsAt: '2025-06-30T00:00:00Z',
      location: 'Online',
      totalTickets: 5200,
      ticketsSold: 0,
      slug: 'pi-giveaway-10k',
      status: 'active',
      type: 'pi',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    comp: {
      title: '5,000 Pi Giveaway',
      prize: '5,000 π',
      piAmount: 1.8,
      date: 'June 29, 2025',
      time: '12:00 AM UTC',
      endsAt: '2025-06-30T00:00:00Z',
      location: 'Online',
      totalTickets: 2900,
      ticketsSold: 0,
      slug: 'pi-giveaway-5k',
      status: 'active',
      type: 'pi',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    comp: {
      title: '2,500 Pi Giveaway',
      prize: '2,500 π',
      piAmount: 1.6,
      date: 'June 28, 2025',
      time: '12:00 AM UTC',
      endsAt: '2025-06-29T00:00:00Z',
      location: 'Online',
      totalTickets: 1600,
      ticketsSold: 0,
      slug: 'pi-giveaway-2.5k',
      status: 'active',
      type: 'pi',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
];

async function seedPiCompetitions() {
  const client = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('competitions');

    // Upsert each competition
    for (const competition of piCompetitions) {
      const result = await collection.updateOne(
        { 'comp.slug': competition.comp.slug },
        { $set: competition },
        { upsert: true }
      );

      if (result.upsertedCount) {
        console.log(`✅ Created competition: ${competition.comp.title}`);
      } else if (result.modifiedCount) {
        console.log(`✅ Updated competition: ${competition.comp.title}`);
      } else {
        console.log(`ℹ️ No changes needed for: ${competition.comp.title}`);
      }
    }

    console.log('✅ All competitions seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding competitions:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run the seeding
seedPiCompetitions();
