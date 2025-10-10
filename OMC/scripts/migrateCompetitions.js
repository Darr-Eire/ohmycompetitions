// scripts/migrateCompetitions.js

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectToDatabase } from '../src/lib/dbConnect.js';
import Competition from '../src/models/Competition.js';

dotenv.config({ path: '.env.local' });

async function migrateCompetitions() {
  try {
    await connectToDatabase();

    const existing = await Competition.find({});

    for (const old of existing) {
      const migrated = {
        title: old.title,
        prize: old.prize || old.title, // fallback
        theme: old.theme || 'general',
        href: `/competitions/${old.slug}`,
        imageUrl: old.imageUrl || '/images/default.jpg',
        comp: {
          slug: old.slug,
          entryFee: old.entryFee,
          totalTickets: old.totalTickets,
          ticketsSold: old.ticketsSold || 0,
          startsAt: old.startsAt || old.endsAt,  // fallback if missing
          endsAt: old.endsAt
        }
      };

      // replace document
      await Competition.findByIdAndUpdate(old._id, migrated, { new: true });
    }

    console.log('✅ Migration completed successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrateCompetitions();
