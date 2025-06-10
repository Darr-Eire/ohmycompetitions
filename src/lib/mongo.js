// lib/mongo.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGO_DB_URL;const options = {};
let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env");
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default async function db() {
  const client = await clientPromise;
  return client.db(); // use .db("your-db-name") if needed
}
