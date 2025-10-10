const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGO_DB_URL;

if (!MONGODB_URI) {
  console.error('❌ MONGO_DB_URL not found in environment variables');
  process.exit(1);
}

async function fixEmailIndex() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Drop existing email index if it exists
    console.log('🔄 Dropping existing email index...');
    try {
      await usersCollection.dropIndex('email_1');
      console.log('✅ Dropped existing email index');
    } catch (err) {
      if (err.code === 26) {
        console.log('ℹ️ Email index does not exist, skipping drop');
      } else {
        throw err;
      }
    }
    
    // Create new partial unique index
    console.log('🔄 Creating new partial unique index on email...');
    await usersCollection.createIndex(
      { email: 1 },
      { 
        unique: true,
        partialFilterExpression: { email: { $type: "string" } }
      }
    );
    console.log('✅ Created new partial unique index on email');
    
    // List all indexes to verify
    console.log('\n📋 Current indexes on users collection:');
    const indexes = await usersCollection.listIndexes().toArray();
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
  } catch (err) {
    console.error('❌ Error fixing email index:', err);
    process.exit(1);
  } finally {
    await client.close();
    console.log('✅ Disconnected from MongoDB');
  }
}

fixEmailIndex(); 