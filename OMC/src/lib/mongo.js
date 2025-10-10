import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_DB_URL; // keep this name if you prefer
const options = {};

if (!uri) throw new Error('❌ MONGO_DB_URL not defined in env');

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// ⬇️ add this
export async function getDb(dbName = 'ohmycompetitions') {
  const client = await clientPromise;
  return client.db(dbName);
}
