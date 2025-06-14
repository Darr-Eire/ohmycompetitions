import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_DB_URL;
const options = {};

let client;
let clientPromise;

if (!process.env.MONGO_DB_URL) {
  throw new Error('❌ MONGO_DB_URL not defined in .env.local');
}

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
