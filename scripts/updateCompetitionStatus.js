const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGO_URI = process.env.MONGO_DB_URL;

console.log('🔄 Starting competition status update script...');

if (!MONGO_URI) {
  console.error('❌ Missing MongoDB connection string.');
  process.exit(1);
}

async function updateCompetitions() {
  let client;
  try {
    console.log('🔄 Connecting to MongoDB...');
    client = new MongoClient(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();

    // Get current time
    const now = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    // Update TV competition
    console.log('🔄 Updating TV competition...');
    const tvResult = await db.collection('competitions').updateOne(
      { 'comp.slug': '55-inch-tv-giveaway' },
      { 
        $set: { 
          'comp.status': 'active',
          'comp.startsAt': now.toISOString(),
          'comp.endsAt': oneMonthFromNow.toISOString(),
          'comp.ticketsSold': 0
        } 
      }
    );
    
    if (tvResult.modifiedCount > 0) {
      console.log('✅ TV competition updated successfully');
    } else {
      console.log('⚠️ TV competition not found or no changes made');
    }

    // Update PS5 competition
    console.log('🔄 Updating PS5 competition...');
    const ps5Result = await db.collection('competitions').updateOne(
      { 'comp.slug': 'ps5-bundle-giveaway' },
      { 
        $set: { 
          'comp.status': 'active',
          'comp.startsAt': now.toISOString(),
          'comp.endsAt': oneMonthFromNow.toISOString(),
          'comp.ticketsSold': 0
        } 
      }
    );
    
    if (ps5Result.modifiedCount > 0) {
      console.log('✅ PS5 competition updated successfully');
    } else {
      console.log('⚠️ PS5 competition not found or no changes made');
    }

    // Check the updated competitions
    console.log('🔄 Checking updated competitions...');
    const competitions = await db.collection('competitions').find(
      { 'comp.slug': { $in: ['55-inch-tv-giveaway', 'ps5-bundle-giveaway'] } },
      {
        projection: {
          'comp.slug': 1,
          'comp.status': 1,
          'comp.startsAt': 1,
          'comp.endsAt': 1,
          'comp.ticketsSold': 1,
          'comp.totalTickets': 1,
          'comp.entryFee': 1,
          title: 1
        }
      }
    ).toArray();

    console.log('📝 Updated competition details:');
    competitions.forEach(comp => {
      console.log(`  - ${comp.title}:`);
      console.log(`    Slug: ${comp.comp.slug}`);
      console.log(`    Status: ${comp.comp.status}`);
      console.log(`    Starts: ${comp.comp.startsAt}`);
      console.log(`    Ends: ${comp.comp.endsAt}`);
      console.log(`    Entry Fee: ${comp.comp.entryFee} π`);
      console.log(`    Tickets: ${comp.comp.ticketsSold}/${comp.comp.totalTickets}`);
      console.log('');
    });

  } catch (err) {
    console.error('❌ Error updating competitions:', err);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('✅ Disconnected from MongoDB');
    }
    process.exit(0);
  }
}

updateCompetitions(); 