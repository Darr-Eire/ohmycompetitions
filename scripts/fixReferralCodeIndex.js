const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGO_DB_URL;

if (!MONGODB_URI) {
  console.error('❌ MONGO_DB_URL not found in environment variables');
  process.exit(1);
}

async function fixReferralCodeIndex() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Drop existing referralCode index if it exists
    console.log('🔄 Dropping existing referralCode index...');
    try {
      await usersCollection.dropIndex('referralCode_1');
      console.log('✅ Dropped existing referralCode index');
    } catch (err) {
      if (err.code === 27 || err.code === 26) {
        console.log('ℹ️ referralCode index does not exist, skipping drop');
      } else {
        throw err;
      }
    }
    
    // Create new partial unique index
    console.log('🔄 Creating new partial unique index on referralCode...');
    await usersCollection.createIndex(
      { referralCode: 1 },
      { 
        unique: true,
        partialFilterExpression: { referralCode: { $type: "string" } }
      }
    );
    console.log('✅ Created new partial unique index on referralCode');
    
    // List all indexes to verify
    console.log('\n📋 Current indexes on users collection:');
    const indexes = await usersCollection.listIndexes().toArray();
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
  } catch (err) {
    console.error('❌ Error fixing referralCode index:', err);
    process.exit(1);
  } finally {
    await client.close();
    console.log('✅ Disconnected from MongoDB');
  }
}

fixReferralCodeIndex(); 