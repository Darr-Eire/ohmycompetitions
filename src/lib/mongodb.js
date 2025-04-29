// scripts/test-mongo.js
import clientPromise from './src/lib/mongodb.js';

async function test() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map((c) => c.name));
    process.exit(0);
  } catch (err) {
    console.error('Connection test failed:', err);
    process.exit(1);
  }
}

test();
