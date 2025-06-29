require('dotenv').config({path:'.env.local'});
const {MongoClient} = require('mongodb');

(async () => {
  try {
    const client = new MongoClient(process.env.MONGO_DB_URL);
    await client.connect();
    const db = client.db();
    
    const result = await db.collection('gameresults').deleteMany({game: 'hack_vault'});
    console.log('✅ Deleted', result.deletedCount, 'hack vault results');
    
    await client.close();
    console.log('🎮 Database cleaned - you can test again!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})(); 