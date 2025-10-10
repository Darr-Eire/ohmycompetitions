require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGO_DB_URL;

async function checkUser() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔍 Checking user: darreire2020');
    
    // Find user
    const user = await db.collection('users').findOne({ username: 'darreire2020' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('\n✅ User found:');
    console.log(`Username: ${user.username}`);
    console.log(`Pi User ID: ${user.piUserId}`);
    console.log(`UID: ${user.uid}`);
    console.log(`Last Login: ${user.lastLogin}`);
    
    // Check payments
    const userPiId = user.piUserId || user.uid;
    const payments = await db.collection('payments').find({
      $and: [
        { status: 'completed' },
        {
          $or: [
            { 'piUser.uid': userPiId },
            { 'piUser.uid': user.username },
            { 'piUser.username': user.username }
          ]
        }
      ]
    }).toArray();
    
    console.log(`\n💰 Payments: ${payments.length} completed payments found`);
    
    if (payments.length > 0) {
      payments.forEach((p, i) => {
        console.log(`${i+1}. ${p.competitionSlug} - ${p.ticketQuantity || 1} tickets - ${p.amount || 0} π`);
      });
    } else {
      console.log('No payments found for this user');
    }
    
    // Check entries
    const entries = await db.collection('entries').find({
      $or: [
        { userUid: user.username },
        { userUid: userPiId },
        { username: user.username }
      ]
    }).toArray();
    
    console.log(`\n🎫 Entries: ${entries.length} entries found`);
    
    // Check tickets (gifted)
    const tickets = await db.collection('tickets').find({ username: user.username }).toArray();
    console.log(`\n🎁 Gifted Tickets: ${tickets.length} gifted tickets found`);
    
    console.log('\n📊 SUMMARY:');
    console.log(`Total Competitions Entered: ${payments.length + entries.length + tickets.length}`);
    console.log(`Paid Entries: ${payments.length}`);
    console.log(`Other Entries: ${entries.length}`);
    console.log(`Gifted Tickets: ${tickets.length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

checkUser(); 