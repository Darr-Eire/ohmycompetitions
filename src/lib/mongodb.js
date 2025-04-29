// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the client is reused 
  // across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Connect to the database and return { client, db }.
 * 
 * Usage in your API route:
 * 
 *   import clientPromise from '../../lib/mongodb';
 * 
 *   export default async function handler(req, res) {
 *     const client = await clientPromise;
 *     const db = client.db(); // defaults to the database in your URI
 *     const competitions = await db.collection('competitions').find({}).toArray();
 *     res.status(200).json(competitions);
 *   }
 */
export default clientPromise;
