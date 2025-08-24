// scripts/cleanupNullUids.js
/* eslint-disable no-console */
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

/* --------------------- Load .env.local if exists, else .env -------------------- */
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = fs.existsSync(envLocalPath)
  ? envLocalPath
  : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

/* ----------------------------- Config & Globals ----------------------------- */
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'ohmycompetitions';

if (!MONGODB_URI) {
  console.error(`❌ Missing MONGODB_URI env var. Checked: ${envPath}`);
  process.exit(1);
}

// CLI flags
const DRY_RUN = process.argv.includes('--dry-run');
const AUTO_YES = process.argv.includes('--yes');

async function cleanupNullUids() {
  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    await client.connect();
    console.log(`✅ Connected to MongoDB database: ${MONGODB_DB}`);

    const db = client.db(MONGODB_DB);
    const Users = db.collection('users');

    const filter = { $or: [{ uid: null }, { uid: { $exists: false } }] };

    // Count first
    const count = await Users.countDocuments(filter, { maxTimeMS: 5000 });
    if (count === 0) {
      console.log('🎉 No users with null/missing uid found. Nothing to do.');
      return;
    }

    console.log(
      `⚠️ Found ${count} user(s) with null/missing uid.${DRY_RUN ? ' (dry-run)' : ''}`
    );

    if (DRY_RUN) return;

    if (!AUTO_YES) {
      process.stdout.write('Type "DELETE" to confirm: ');
      await new Promise((resolve) => {
        process.stdin.setEncoding('utf8');
        process.stdin.once('data', (data) => {
          const ans = String(data || '').trim();
          if (ans !== 'DELETE') {
            console.log('❎ Aborted.');
            process.exit(0);
          }
          resolve();
        });
      });
    }

    const result = await Users.deleteMany(filter, {
      writeConcern: { w: 'majority' },
      maxTimeMS: 10_000,
    });

    console.log(`🧹 Deleted ${result.deletedCount} user(s) with null/missing uid`);
  } catch (err) {
    console.error('❌ Cleanup error:', err?.message || err);
    process.exitCode = 1;
  } finally {
    try {
      await client.close();
    } catch {}
  }
}

cleanupNullUids();
