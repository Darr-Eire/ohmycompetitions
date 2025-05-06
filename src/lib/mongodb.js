import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

// Ensure URI is defined
if (!uri) {
  throw new Error('❌ Please define the MONGODB_URI environment variable in .env.local');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // Reuse the global MongoClient instance during development
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Create a new client in production
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
