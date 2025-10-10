import FunnelCompetition from '../models/FunnelCompetition.js';
import FunnelAdvance from '../models/FunnelAdvance.js';

export function makeSlug(stage) {
  const now = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 6);
  return `stage${stage}-${now}-${rand}`;
}

export async function createStageInstance({ stage, capacity = 25, advancing = 5, cycleId } = {}) {
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

export async function ensureOpenStage1(minOpen = 2, cfg = {}) {
  const open = await FunnelCompetition.countDocuments({ stage: 1, status: 'filling' });
  const toCreate = Math.max(0, minOpen - open);
  const creates = [];
  for (let i = 0; i < toCreate; i++) {
    creates.push(createStageInstance({ stage: 1, ...cfg }));
  }
  if (creates.length) await Promise.all(creates);
  return toCreate;
}

export async function maybeGoLive(comp) {
  if (comp.status === 'filling' && comp.entrantsCount >= comp.capacity) {
    comp.status = 'live';
    comp.startsAt = comp.startsAt || new Date();
    await comp.save();
    return true;
  }
  return false;
}

// Admin ends a comp -> pick winners -> queue them for the next stage
export async function endCompetitionAndQueueWinners(slug, winnersUserIds = []) {
  const comp = await FunnelCompetition.findOne({ slug });
  if (!comp) throw new Error('Competition not found');
  if (comp.status === 'ended') return comp;

  comp.status = 'ended';
  comp.endsAt = new Date();
  comp.winners = winnersUserIds.slice(0, comp.advancing);
  await comp.save();

  if (comp.stage < 5 && comp.winners.length) {
    const toStage = comp.stage + 1;
    const docs = comp.winners.map(userId => ({
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

// Consume winners from queue to auto-create & fill the next-stage comp
export async function promoteFromQueue(toStage, { capacity = 25, advancing = 5, cycleId } = {}) {
  // Find earliest winners waiting
  const winners = await FunnelAdvance.find({ toStage, consumed: false })
    .sort({ createdAt: 1 })
    .limit(capacity);

  if (winners.length < capacity) return null;

  const comp = await createStageInstance({ stage: toStage, capacity, advancing, cycleId });

  // Pre-populate entrants (invite-only stage)
  comp.entrants = winners.map(w => ({ userId: w.userId, score: 0, joinedAt: new Date() }));
  comp.entrantsCount = comp.entrants.length;
  // Stage >= 2 can start immediately when full:
  comp.status = 'live';
  comp.startsAt = new Date();
  await comp.save();

  // Consume queue
  const ids = winners.map(w => w._id);
  await FunnelAdvance.updateMany({ _id: { $in: ids } }, { $set: { consumed: true } });

  return comp;
}
