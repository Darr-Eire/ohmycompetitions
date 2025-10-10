const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGO_DB_URL;

if (!MONGODB_URI) {
  console.error('❌ MONGO_DB_URL not found in environment variables');
  process.exit(1);
}

async function checkPenthouseCompetition() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const competitionsCollection = db.collection('competitions');
    
    // Check for penthouse-stay competition
    console.log('🔍 Checking for penthouse-stay competition...');
    
    const penthouseComp = await competitionsCollection.findOne({ 'comp.slug': 'penthouse-stay' });
    
    if (penthouseComp) {
      console.log('✅ Found penthouse-stay competition:');
      console.log(JSON.stringify(penthouseComp, null, 2));
    } else {
      console.log('❌ penthouse-stay competition not found with comp.slug query');
      
      // Try alternative queries
      console.log('🔍 Trying alternative queries...');
      
      const altQuery1 = await competitionsCollection.findOne({ slug: 'penthouse-stay' });
      if (altQuery1) {
        console.log('✅ Found with direct slug query:');
        console.log(JSON.stringify(altQuery1, null, 2));
      }
      
      const altQuery2 = await competitionsCollection.findOne({ 'comp.slug': { $regex: 'penthouse', $options: 'i' } });
      if (altQuery2) {
        console.log('✅ Found with regex query:');
        console.log(JSON.stringify(altQuery2, null, 2));
      }
      
      // List all competitions to see the structure
      console.log('\n📋 All competitions in database:');
      const allComps = await competitionsCollection.find({}).toArray();
      allComps.forEach((comp, index) => {
        console.log(`${index + 1}. ${comp.title || 'No title'} - slug: ${comp.comp?.slug || comp.slug || 'No slug'}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Error checking competition:', err);
    process.exit(1);
  } finally {
    await client.close();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkPenthouseCompetition(); 