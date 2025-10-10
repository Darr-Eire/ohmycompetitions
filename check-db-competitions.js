require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_DB_URL);

async function checkCompetitions() {
  try {
    await client.connect();
    const db = client.db();
    const competitions = await db.collection('competitions').find({}).toArray();
    
    console.log('Current Competitions in Database:');
    console.log('================================');
    console.log(`Total: ${competitions.length} competitions\n`);
    
    competitions.forEach((comp, i) => {
      console.log(`${i+1}. ${comp.title || comp.comp?.title || 'No title'}`);
      console.log(`   Slug: ${comp.comp?.slug || comp.slug || 'No slug'}`);
      console.log(`   Theme: ${comp.theme || comp.comp?.theme || 'No theme'}`);
      console.log(`   Status: ${comp.comp?.status || comp.status || 'No status'}`);
      console.log(`   Entry Fee: ${comp.comp?.entryFee || comp.entryFee || 'No fee'} π`);
      console.log(`   Tickets Sold: ${comp.comp?.ticketsSold || comp.ticketsSold || 0}`);
      console.log(`   Total Tickets: ${comp.comp?.totalTickets || comp.totalTickets || 'No total'}`);
      console.log(`   Ends At: ${comp.comp?.endsAt || comp.endsAt || 'No end date'}`);
      console.log(`   Image: ${comp.imageUrl || 'No image'}`);
      console.log('');
    });
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

checkCompetitions(); 