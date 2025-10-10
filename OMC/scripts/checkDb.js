const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGO_URI = process.env.MONGO_DB_URL;

if (!MONGO_URI) {
  console.error('No MongoDB URI found in .env.local');
  process.exit(1);
}

async function main() {
  console.log('Connecting to MongoDB...');
  
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    await client.connect();
    console.log('Connected successfully');

    const db = client.db();
    const competitions = await db.collection('competitions').find({}).toArray();

    console.log(`\nFound ${competitions.length} competitions:\n`);

    competitions.forEach(comp => {
      console.log(`${comp.title} (${comp.comp.slug})`);
      console.log(`Status: ${comp.comp.status}`);
      console.log(`Tickets: ${comp.comp.ticketsSold}/${comp.comp.totalTickets}`);
      console.log(`Entry Fee: ${comp.comp.entryFee} π`);
      console.log('---');
    });

  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed');
  }
}

main().catch(console.error); 