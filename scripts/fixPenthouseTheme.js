const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGO_DB_URL;

if (!MONGODB_URI) {
  console.error('❌ MONGO_DB_URL not found in environment variables');
  process.exit(1);
}

async function fixPenthouseTheme() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const competitionsCollection = db.collection('competitions');
    
    // Update the penthouse-stay competition to add the theme field
    console.log('🔄 Adding theme field to penthouse-stay competition...');
    
    const result = await competitionsCollection.updateOne(
      { 'comp.slug': 'penthouse-stay' },
      { $set: { theme: 'premium' } }
    );
    
    if (result.matchedCount > 0) {
      console.log('✅ Theme field added to penthouse-stay competition');
      
      // Verify the update
      const updatedComp = await competitionsCollection.findOne({ 'comp.slug': 'penthouse-stay' });
      console.log('📋 Updated competition:');
      console.log(JSON.stringify(updatedComp, null, 2));
    } else {
      console.log('❌ Competition not found for update');
    }
    
  } catch (err) {
    console.error('❌ Error updating competition:', err);
    process.exit(1);
  } finally {
    await client.close();
    console.log('✅ Disconnected from MongoDB');
  }
}

fixPenthouseTheme(); 