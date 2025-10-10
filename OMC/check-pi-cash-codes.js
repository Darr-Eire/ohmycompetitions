require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_DB_URL);

async function checkCodes() {
  try {
    await client.connect();
    const db = client.db();
    const codes = await db.collection('pi_cash_codes').find({}).toArray();
    
    console.log('Current Pi Cash Codes:');
    console.log('======================');
    
    codes.forEach((code, i) => {
      const now = new Date();
      const weekStart = new Date(code.weekStart);
      const expiresAt = new Date(code.expiresAt);
      const isActive = now >= weekStart && now <= expiresAt;
      const hasWinner = code.winner;
      const canDelete = !isActive && !hasWinner;
      
      console.log(`\n${i+1}. Code: ${code.code}`);
      console.log(`   Week Start: ${weekStart.toISOString()}`);
      console.log(`   Expires At: ${expiresAt.toISOString()}`);
      console.log(`   Is Active: ${isActive}`);
      console.log(`   Has Winner: ${!!hasWinner}`);
      console.log(`   Can Delete: ${canDelete}`);
      
      if (hasWinner) {
        console.log(`   Winner: ${hasWinner.username} (${hasWinner.uid})`);
      }
      
      if (!canDelete) {
        if (isActive) {
          console.log(`   ❌ Cannot delete: Code is currently active`);
        }
        if (hasWinner) {
          console.log(`   ❌ Cannot delete: Code has a winner`);
        }
      } else {
        console.log(`   ✅ Can be deleted`);
      }
    });
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

checkCodes(); 