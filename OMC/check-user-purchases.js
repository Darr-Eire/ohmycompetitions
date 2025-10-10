require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGO_DB_URL;

if (!MONGODB_URI) {
  console.error('❌ MONGO_DB_URL not found in environment variables');
  process.exit(1);
}

async function checkUserPurchases() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔍 Checking purchases for user: darreire2020\n');
    
    // 1. Find the user
    console.log('1️⃣ USER INFORMATION:');
    const user = await db.collection('users').findOne({
      $or: [
        { username: 'darreire2020' },
        { piUserId: 'darreire2020' },
        { uid: 'darreire2020' }
      ]
    });
    
    if (!user) {
      console.log('❌ User "darreire2020" not found in users collection');
      return;
    }
    
    console.log('✅ User found:');
    console.log('  Username:', user.username);
    console.log('  Pi User ID:', user.piUserId);
    console.log('  Legacy UID:', user.uid);
    console.log('  Created:', user.createdAt);
    console.log('  Last Login:', user.lastLogin);
    console.log('  Bonus Tickets:', user.bonusTickets || 0);
    
    // 2. Check payments
    console.log('\n2️⃣ COMPLETED PAYMENTS:');
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
    
    console.log(`Found ${payments.length} completed payments`);
    
    if (payments.length > 0) {
      let totalSpent = 0;
      let totalTickets = 0;
      const competitionCounts = {};
      
      payments.forEach((payment, index) => {
        console.log(`\nPayment ${index + 1}:`);
        console.log('  Payment ID:', payment.paymentId);
        console.log('  Competition:', payment.competitionSlug);
        console.log('  Amount:', payment.amount || 'undefined');
        console.log('  Ticket Number:', payment.ticketNumber);
        console.log('  Quantity:', payment.ticketQuantity || 1);
        console.log('  Completed:', payment.completedAt);
        console.log('  Pi User:', payment.piUser);
        
        // Add to totals
        totalSpent += payment.amount || 0;
        totalTickets += payment.ticketQuantity || 1;
        
        // Count by competition
        const comp = payment.competitionSlug || 'unknown';
        competitionCounts[comp] = (competitionCounts[comp] || 0) + (payment.ticketQuantity || 1);
      });
      
      console.log('\n📊 PURCHASE SUMMARY:');
      console.log(`  Total Spent: ${totalSpent.toFixed(2)} π`);
      console.log(`  Total Tickets: ${totalTickets}`);
      console.log(`  Competitions Entered: ${Object.keys(competitionCounts).length}`);
      
      console.log('\n🎯 TICKETS BY COMPETITION:');
      Object.entries(competitionCounts).forEach(([comp, count]) => {
        console.log(`  ${comp}: ${count} tickets`);
      });
    }
    
    // 3. Check Entry model (alternative ticket storage)
    console.log('\n3️⃣ ENTRY MODEL TICKETS:');
    const entries = await db.collection('entries').find({
      $or: [
        { userUid: user.username },
        { userUid: userPiId },
        { username: user.username }
      ]
    }).toArray();
    
    console.log(`Found ${entries.length} entries`);
    if (entries.length > 0) {
      entries.forEach((entry, index) => {
        console.log(`\nEntry ${index + 1}:`);
        console.log('  Competition ID:', entry.competitionId);
        console.log('  Competition Name:', entry.competitionName);
        console.log('  User UID:', entry.userUid);
        console.log('  Username:', entry.username);
        console.log('  Quantity:', entry.quantity || entry.ticketCount || 1);
        console.log('  Created:', entry.createdAt);
      });
    }
    
    // 4. Check Ticket model (gifted tickets)
    console.log('\n4️⃣ GIFTED TICKETS:');
    const giftedTickets = await db.collection('tickets').find({
      username: user.username
    }).toArray();
    
    console.log(`Found ${giftedTickets.length} gifted tickets`);
    if (giftedTickets.length > 0) {
      giftedTickets.forEach((ticket, index) => {
        console.log(`\nGifted Ticket ${index + 1}:`);
        console.log('  Competition:', ticket.competitionTitle);
        console.log('  Quantity:', ticket.quantity || 1);
        console.log('  Gifted By:', ticket.giftedBy);
        console.log('  Purchased At:', ticket.purchasedAt);
      });
    }
    
    // 5. Test the API endpoint
    console.log('\n5️⃣ API ENDPOINT TEST:');
    try {
      const axios = require('axios');
      const baseUrl = 'http://localhost:3000';
      
      const response = await axios.get(`${baseUrl}/api/user/tickets?username=${user.username}`);
      const apiTickets = response.data || [];
      
      console.log(`✅ API returned ${apiTickets.length} tickets for ${user.username}`);
      if (apiTickets.length > 0) {
        console.log('\nAPI Ticket Summary:');
        apiTickets.forEach((ticket, index) => {
          console.log(`  ${index + 1}. ${ticket.competitionTitle} - ${ticket.quantity} tickets (${ticket.gifted ? 'Gifted' : 'Purchased'})`);
        });
      }
    } catch (apiError) {
      console.log('⚠️ Could not test API endpoint (server may not be running):', apiError.message);
    }
    
    console.log('\n✅ User purchase analysis complete!');
    
  } catch (error) {
    console.error('❌ Error checking user purchases:', error);
  } finally {
    await client.close();
  }
}

checkUserPurchases(); 