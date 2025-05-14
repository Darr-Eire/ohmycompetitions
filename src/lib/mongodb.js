const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('❌ Please define the MONGODB_URI environment variable in .env.local');
}

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

async function connectToDatabase() {
  const client = await clientPromise;
  return client.db(); // You can specify .db('your-db-name') if you want
}

module.exports = {
  connectToDatabase,
};
