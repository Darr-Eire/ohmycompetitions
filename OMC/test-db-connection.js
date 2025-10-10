#!/usr/bin/env node

/**
 * Test Database Connection
 * Simple script to test MongoDB connection
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const URI = process.env.MONGODB_URI || process.env.MONGO_DB_URI || process.env.MONGO_DB_URL;

console.log('🔍 Testing MongoDB Connection...');
console.log('📍 URI:', URI ? 'Set' : 'Not set');

if (!URI) {
  console.error('❌ No MongoDB URI found in environment variables');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    await mongoose.connect(URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📍 Host:', mongoose.connection.host);
    console.log('📍 Database:', mongoose.connection.name);
    console.log('📍 Mongoose version:', mongoose.version);
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Collections found:', collections.length);
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('🔍 Error details:', error);
    process.exit(1);
  }
}

testConnection();
