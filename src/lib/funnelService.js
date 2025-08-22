// src/lib/funnelService.js
// Centralized helpers for the multi-stage funnel competitions

import { dbConnect } from 'lib/dbConnect';
import FunnelCompetition from 'models/FunnelCompetition';
import FunnelAdvance from 'models/FunnelAdvance';

/** Public constant used by API routes for pricing, update as needed */
export const ENTRY_FEE_PI = 1;

/** Slug helper: stageN-YYYYMMDDhhmmss-rand */
export function makeSlug(stage) {
  const now = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 6);
  return `stage${stage}-${now}-${rand}`;
}

/**
 * Create a funnel competition instance for a given stage.
 * @param {Object} cfg
 * @param {number} cfg.stage - stage index (1..5)
 * @param {number} cfg.capacity - entrants to fill before "live"
 * @param {number} cfg.advancing - winners that advance to next stage
 * @param {string=} cfg.cycleId - optional cycle grouping id
 */
export async function createStageInstance({ stage, capacity = 25, advancing = 5, cycleId } = {}) {
  await dbConnect();
  const slug = makeSlug(stage);
  const doc = await FunnelCompetition.create({
    slug,
    stage,
    capacity,
    advancing,
    status: 'filling',
    cycleId,
    entrants: [],
    entrantsCount: 0,
  });
  return doc;
}

/**
 * Ensure at least `minOpen` stage-1 rooms exist in "filling" state.
 * Returns number created.
 */
export async function ensureOpenStage1(minOpen = 2, cfg = {}) {
  await dbConnect();
  const open = await FunnelCompetition.countDocuments({ stage: 1, status: 'filling' });
  const toCreate = Math.max(0, minOpen - open);
  if (toCreate > 0) {
    await Promise.all(Array.from({ length: toCreate }, () => createStageInstance({ stage: 1, ...cfg })));
  }
  return toCreate;
}

/** If full, move comp to live and set startsAt. Returns true if changed. */
export async function maybeGoLive(comp) {
  if (comp.status === 'filling' && comp.entrantsCount >= comp.capacity) {
    comp.status = 'live';
    if (!comp.startsAt) comp.startsAt = new Date();
    await comp.save();
    return true;
  }
  return false;
}

/**
 * Admin ends a comp, records winners, and queues them for next stage.
 * Returns updated competition doc.
 */
export async function endCompetitionAndQueueWinners(slug, winnersUserIds = []) {
  await dbConnect();

  const comp = await FunnelCompetition.findOne({ slug });
  if (!comp) throw new Error('Competition not found');
  if (comp.status === 'ended') return comp;

  comp.status = 'ended';
  comp.endsAt = new Date();
  comp.winners = winnersUserIds.slice(0, comp.advancing);
  await comp.save();

  if (comp.stage < 5 && comp.winners.length > 0) {
    const toStage = comp.stage + 1;
    const docs = comp.winners.map((userId) => ({
      userId,
      fromStage: comp.stage,
      toStage,
      cycleId: comp.cycleId,
      consumed: false,
    }));
    await FunnelAdvance.insertMany(docs);
  }

  return comp;
}

/**
 * Consume queued winners for `toStage` and auto-create & fill a next-stage comp.
 * Returns the created competition or null if not enough winners yet.
 */
export async function promoteFromQueue(toStage, { capacity = 25, advancing = 5, cycleId } = {}) {
  await dbConnect();

  const winners = await FunnelAdvance.find({ toStage, consumed: false })
    .sort({ createdAt: 1 })
    .limit(capacity);

  if (winners.length < capacity) return null;

  const comp = await createStageInstance({ stage: toStage, capacity, advancing, cycleId });

  comp.entrants = winners.map((w) => ({ userId: w.userId, score: 0, joinedAt: new Date() }));
  comp.entrantsCount = comp.entrants.length;
  comp.status = 'live';
  comp.startsAt = new Date();
  await comp.save();

  const ids = winners.map((w) => w._id);
  await FunnelAdvance.updateMany({ _id: { $in: ids } }, { $set: { consumed: true } });

  return comp;
}

/**
 * Assign a user to a Stage 1 room.
 * Ensures there is at least one "filling" room, then puts the user into the first available room.
 * Returns assignment metadata for UI.
 */
export async function assignStage1Room(username = '', { cycleId, capacity = 25, advancing = 5 } = {}) {
  await dbConnect();

  // Keep at least 2 open rooms to smooth spikes
  await ensureOpenStage1(2, { capacity, advancing, cycleId });

  // Find a filling room with space
  let room = await FunnelCompetition.findOne({
    stage: 1,
    status: 'filling',
    $expr: { $lt: ['$entrantsCount', '$capacity'] },
  }).sort({ createdAt: 1 });

  // If none found, create a fresh one
  if (!room) {
    room = await createStageInstance({ stage: 1, capacity, advancing, cycleId });
  }

  // Add entrant if username provided (optional)
  if (username) {
    // Avoid dupes
    const alreadyIn = room.entrants?.some((e) => e?.username === username);
    if (!alreadyIn) {
      room.entrants = room.entrants || [];
      room.entrants.push({ username, score: 0, joinedAt: new Date() });
      room.entrantsCount = (room.entrantsCount || 0) + 1;
      await room.save();
      await maybeGoLive(room);
    }
  }

  return {
    stage: room.stage,
    roomSlug: room.slug,
    capacity: room.capacity,
    advancing: room.advancing,
    entrantsCount: room.entrantsCount,
    status: room.status,
  };
}
