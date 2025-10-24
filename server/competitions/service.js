// Uses your existing Mongoose connection + Competition model
import db from '@/lib/db'; // ensures connection (your file)
import Competition from '@/models/Competition';
import { normalizeCompetition } from './normalize';

async function ensureDb() {
  // if your db.js handles singleton connect, simply import it.
  // calling db() or db.connect() only if required by your implementation.
  if (typeof db === 'function') {
    await db();
  } else if (db?.connect) {
    await db.connect();
  }
}

// List active competitions, normalized, with a sensible ordering
export async function listActiveCompetitions() {
  await ensureDb();

  const rows = await Competition.find(
    { status: 'active' },
    // projection: only what we need
    'id slug title prizeLabel prizePi entryFeePi totalTickets ticketsSold maxPerUser startsAt endsAt imageUrl tags theme freeEntryUrl status createdAt'
  )
    .sort({ endsAt: 1, startsAt: 1, createdAt: -1 })
    .lean()
    .exec();

  return rows.map(normalizeCompetition);
}

// Get one by slug (active only), normalized
export async function getBySlug(slug) {
  await ensureDb();

  const row = await Competition.findOne(
    { slug, status: 'active' },
    'id slug title prizeLabel prizePi entryFeePi totalTickets ticketsSold maxPerUser startsAt endsAt imageUrl tags theme freeEntryUrl status'
  )
    .lean()
    .exec();

  return row ? normalizeCompetition(row) : null;
}
