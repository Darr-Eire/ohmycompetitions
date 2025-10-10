// file: src/lib/funnelLobby.js
// In-memory lobby manager for Stage 1 (Qualifiers) and Stage 2 (Final)
// Replace with DB-backed logic in production.

const ENTRY_FEE_PI = 0.15;
const STAGE1_CAPACITY = 25;
const ADVANCING_PER_ROOM = 5;

// Tuning
const MAX_CONCURRENT_S1_DEFAULT = 2; // will scale up to 4 if needed
const MAX_CONCURRENT_S1_HARD_CAP = 4;
const FILL_THRESHOLD = 0.6; // 60%
const WAIT_THRESHOLD_MS = 90 * 1000; // 90s
const S1_TIMEOUT_MS = 5 * 60 * 1000; // start after 5m if >=18 players

// In-memory state
const state = {
  stage1Rooms: [],     // [{id, slug, players:[], createdAt, startedAt, capacity, status:'open'|'live'|'done'}]
  stage2Finals: [],    // [{id, slug, players:[], createdAt, startedAt, status}]
  qualifiersPool: [],  // winners waiting to be placed into a final
  payments: new Map(), // paymentId -> { userId, slug, stage, status }
};

// Helpers
function now() { return Date.now(); }
function genId(prefix='room') { return `${prefix}_${Math.random().toString(36).slice(2, 8)}`; }
function genSlug(stage) { return `s${stage}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; }

function medianWaitMs() {
  const waits = state.stage1Rooms
    .filter(r => r.status === 'open')
    .flatMap(r => r.players.map(p => now() - p.joinedAt));
  if (!waits.length) return 0;
  waits.sort((a,b)=>a-b);
  const mid = Math.floor(waits.length/2);
  return waits.length % 2 ? waits[mid] : Math.floor((waits[mid-1]+waits[mid])/2);
}

function openS1RoomsSorted() {
  return state.stage1Rooms
    .filter(r => r.status === 'open')
    .sort((a,b)=> (b.players.length/b.capacity) - (a.players.length/b.capacity));
}

function rooms60PlusFull(rooms) {
  if (!rooms.length) return false;
  return rooms.every(r => r.players.length / r.capacity >= FILL_THRESHOLD);
}

function countConcurrentOpenS1() {
  return state.stage1Rooms.filter(r => r.status === 'open').length;
}

function createS1Room() {
  const room = {
    id: genId('s1'),
    slug: genSlug(1),
    stage: 1,
    capacity: STAGE1_CAPACITY,
    advancing: ADVANCING_PER_ROOM,
    players: [], // { userId, joinedAt }
    createdAt: now(),
    startedAt: null,
    status: 'open',
  };
  state.stage1Rooms.push(room);
  return room;
}

function createS2FinalRoom(players=[]) {
  const room = {
    id: genId('s2'),
    slug: genSlug(2),
    stage: 2,
    capacity: STAGE1_CAPACITY, // final of 25
    players: players.map(u => ({ userId: u, joinedAt: now() })),
    createdAt: now(),
    startedAt: now(),
    status: 'live',
  };
  state.stage2Finals.push(room);
  return room;
}

function addPlayerToRoom(room, userId) {
  if (room.status !== 'open') return false;
  if (room.players.find(p => p.userId === userId)) return true; // already in
  if (room.players.length >= room.capacity) return false;
  room.players.push({ userId, joinedAt: now() });
  return true;
}

function randomSample(arr, k) {
  const a = arr.slice();
  const res = [];
  while (res.length < Math.min(k, a.length)) {
    const i = Math.floor(Math.random() * a.length);
    res.push(a[i]);
    a.splice(i,1);
  }
  return res;
}

function startS1RoomIfReady(room) {
  if (room.status !== 'open') return false;

  const full = room.players.length >= room.capacity;
  const aged = (now() - room.createdAt) >= S1_TIMEOUT_MS && room.players.length >= 18;

  if (full || aged) {
    room.status = 'live';
    room.startedAt = now();

    // Emulate results: pick 5 random qualifiers
    const winners = randomSample(room.players.map(p => p.userId), room.advancing);
    state.qualifiersPool.push(...winners);

    // Mark done immediately (no long-running live sim here)
    room.status = 'done';

    // If we reached 25 qualifiers, spin up a final
    while (state.qualifiersPool.length >= STAGE1_CAPACITY) {
      const batch = state.qualifiersPool.splice(0, STAGE1_CAPACITY);
      createS2FinalRoom(batch);
    }
    return true;
  }
  return false;
}

function autoSpawnRoomIfNeeded() {
  const open = openS1RoomsSorted();
  const medWait = medianWaitMs();
  const countOpen = open.length;

  const dynamicCap = Math.min(
    MAX_CONCURRENT_S1_HARD_CAP,
    medWait > WAIT_THRESHOLD_MS ? 4 : MAX_CONCURRENT_S1_DEFAULT
  );

  if (!countOpen) {
    createS1Room();
    return;
  }

  // Spawn if all rooms >=60% full AND wait > 90s AND under dynamic cap
  if (rooms60PlusFull(open) && medWait > WAIT_THRESHOLD_MS && countOpen < dynamicCap) {
    createS1Room();
  }
}

function assignStage1Room(userId) {
  autoSpawnRoomIfNeeded();

  const rooms = openS1RoomsSorted();
  let target = rooms[0];

  if (!target) {
    target = createS1Room();
  }

  // Place in most-filled open room if it has space
  if (!addPlayerToRoom(target, userId)) {
    // If that failed (race), try others
    for (const r of rooms) {
      if (addPlayerToRoom(r, userId)) {
        target = r;
        break;
      }
    }
    // If still no luck, create a new room
    if (!rooms.length || target.status !== 'open' || target.players.length >= target.capacity) {
      target = createS1Room();
      addPlayerToRoom(target, userId);
    }
  }

  // After assignment, try to start it if full, or any room that qualifies
  for (const r of state.stage1Rooms) {
    startS1RoomIfReady(r);
  }

  // Simple ETA: if not full, estimate remaining joins @ 10 joins/min
  const remaining = Math.max(0, target.capacity - target.players.length);
  const etaSec = remaining <= 0 ? 0 : Math.ceil((remaining / 10) * 60);

  return { room: target, etaSec };
}

// Public API for routes
export const lobby = {
  // assignment & join
  assignStage1Room,
  addPlayerToRoom,
  createS1Room,
  createS2FinalRoom,
  startS1RoomIfReady,

  // payments (mock storage)
  payments: state.payments,

  // stage feeds
  getStageFeed(stage) {
    if (stage === 1) {
      const filling = state.stage1Rooms
        .filter(r => r.status === 'open')
        .map(r => ({
          slug: r.slug,
          entrantsCount: r.players.length,
          capacity: r.capacity,
          advancing: r.advancing,
          imageUrl: '/pi.jpeg',
          stage: 1,
        }));
      const live = state.stage1Rooms
        .filter(r => r.status === 'live')
        .map(r => ({
          slug: r.slug,
          entrantsCount: r.players.length,
          capacity: r.capacity,
          advancing: r.advancing,
          imageUrl: '/pi.jpeg',
          stage: 1,
          startsAt: new Date(r.startedAt).toISOString(),
        }));
      return { filling, live };
    }

    if (stage === 2) {
      const live = state.stage2Finals
        .filter(r => r.status === 'live')
        .map(r => ({
          slug: r.slug,
          entrantsCount: r.players.length,
          capacity: r.capacity,
          advancing: 1,
          imageUrl: '/pi.jpeg',
          stage: 2,
          startsAt: new Date(r.startedAt).toISOString(),
        }));
      return { filling: [], live };
    }

    // No stages 3–5 in backend; return empty
    return { filling: [], live: [] };
  },
};

// Background ticker to auto-start aging rooms
setInterval(() => {
  try {
    for (const r of state.stage1Rooms) {
      startS1RoomIfReady(r);
    }
    autoSpawnRoomIfNeeded();
  } catch {}
}, 4000);
