import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error('❌ Please define the MONGODB_URI environment variable in .env.local');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // Reuse the client during hot reloads in dev
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Use a new client in production
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// ✅ Optional helper to get the DB (default or custom name)
export async function getDb(dbName = undefined) {
  const client = await clientPromise;
  return client.db(dbName); // e.g., db("your-db-name") if needed
}

export default clientPromise;
