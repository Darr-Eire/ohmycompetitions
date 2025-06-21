const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://ohmycompetitions:DarrenMongo2025@ohmycompetitions.ffrvvr5.mongodb.net/ohmycompetitions?retryWrites=true&w=majority&appName=ohmycompetitions';

async function cleanupNullUids() {
  const client = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    
    // Find and delete users with null UIDs
    const result = await db.collection('users').deleteMany({
      $or: [
        { uid: null },
        { uid: { $exists: false } }
      ]
    });

    console.log(`Deleted ${result.deletedCount} users with null UIDs`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

cleanupNullUids().then(() => process.exit()); 