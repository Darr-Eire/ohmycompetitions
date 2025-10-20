// src/lib/funnelService.js
/* eslint-disable no-console */

let useMemoryStore = false;

/* ------------------------- OPTIONAL: Mongo (Mongoose) ------------------------- */
let mongoose, FunnelModel;

async function initMongooseOnce() {
  if (typeof window !== 'undefined') return; // server-only
  if (mongoose) return;

  try {
    // Lazy import to avoid bundling mongoose into client
    // eslint-disable-next-line global-require
    mongoose = require('mongoose');

    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL;
    if (!uri) {
      useMemoryStore = true;
      return;
    }

    if (!global.__omc_mongoose_conn) {
      global.__omc_mongoose_conn = mongoose.connect(uri, {
        // modern Mongoose defaults; avoid old deprecations
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
      });
    }
    await global.__omc_mongoose_conn;

    if (!global.__omc_FunnelModel) {
      const FunnelSchema = new mongoose.Schema(
        {
          slug: { type: String, required: true, unique: true, index: true },
          stage: { type: Number, default: 1 }, // current stage number
          capacity: { type: Number, default: 0 }, // max entrants for this stage
          entrantsCount: { type: Number, default: 0 }, // cached count for quick reads
          advancing: { type: Number, default: 0 }, // how many advance to next stage
          status: { type: String, default: 'filling' }, // 'filling' | 'closed' | 'completed'
          imageUrl: { type: String, default: '' },
          entrants: { type: [String], default: [] }, // userId list
          meta: { type: Object, default: {} },
        },
        { timestamps: true }
      );

      FunnelSchema.methods.toCleanJSON = function toCleanJSON() {
        return {
          id: this._id?.toString?.(),
          slug: this.slug,
          stage: this.stage,
          capacity: this.capacity,
          entrantsCount: this.entrantsCount ?? (this.entrants?.length || 0),
          advancing: this.advancing,
          status: this.status,
          imageUrl: this.imageUrl,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
        };
      };

      global.__omc_FunnelModel = mongoose.model('Funnel', FunnelSchema);
    }
    FunnelModel = global.__omc_FunnelModel;
  } catch (err) {
    console.warn('[funnelService] Mongoose unavailable, using memory store:', err?.message);
    useMemoryStore = true;
  }
}

/* ------------------------------- Memory fallback ------------------------------ */
const mem = {
  funnels: new Map(), // slug -> funnel
};

function memGet(slug) {
  if (!slug) return null;
  const f = mem.funnels.get(String(slug));
  return f ? { ...f } : null;
}

function memUpsert(input) {
  const slug = String(input.slug);
  const prev = mem.funnels.get(slug) || {
    slug,
    stage: 1,
    capacity: 0,
    entrants: [],
    entrantsCount: 0,
    advancing: 0,
    status: 'filling',
    imageUrl: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const next = {
    ...prev,
    ...input,
    entrantsCount: Array.isArray(input?.entrants)
      ? input.entrants.length
      : (prev.entrants?.length || prev.entrantsCount || 0),
    updatedAt: new Date(),
  };
  mem.funnels.set(slug, next);
  return { ...next };
}

function memList() {
  return Array.from(mem.funnels.values()).map((f) => ({ ...f }));
}

/* --------------------------------- Utilities --------------------------------- */
function clean(doc) {
  if (!doc) return null;
  // mongoose document
  if (typeof doc.toCleanJSON === 'function') return doc.toCleanJSON();
  // raw object (memory)
  return {
    id: doc.id,
    slug: doc.slug,
    stage: Number(doc.stage || 1),
    capacity: Number(doc.capacity || 0),
    entrantsCount: Number(doc.entrantsCount ?? (Array.isArray(doc.entrants) ? doc.entrants.length : 0)),
    advancing: Number(doc.advancing || 0),
    status: String(doc.status || 'filling'),
    imageUrl: doc.imageUrl || '',
    createdAt: doc.createdAt || new Date(),
    updatedAt: doc.updatedAt || new Date(),
  };
}

/* --------------------------------- Services ---------------------------------- */

/**
 * Get a funnel by slug.
 */
async function getFunnelBySlug(slug) {
  if (!slug) return null;
  await initMongooseOnce();
  if (useMemoryStore) {
    return clean(memGet(slug));
  }
  const doc = await FunnelModel.findOne({ slug }).lean(false);
  return doc ? clean(doc) : null;
}

/**
 * Create or update a funnel.
 * Useful for seeding or admin endpoints.
 */
async function upsertFunnel(data) {
  if (!data?.slug) throw new Error('slug is required');
  await initMongooseOnce();
  if (useMemoryStore) {
    return clean(memUpsert(data));
  }
  const update = {
    $set: {
      stage: Number(data.stage ?? 1),
      capacity: Number(data.capacity ?? 0),
      advancing: Number(data.advancing ?? 0),
      status: data.status ?? 'filling',
      imageUrl: data.imageUrl ?? '',
      ...(Array.isArray(data.entrants) ? { entrants: data.entrants, entrantsCount: data.entrants.length } : {}),
      ...(data.meta ? { meta: data.meta } : {}),
    },
  };
  const doc = await FunnelModel.findOneAndUpdate({ slug: data.slug }, update, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
  // ensure entrantsCount is in sync if entrants array exists
  if (Array.isArray(doc.entrants)) {
    doc.entrantsCount = doc.entrants.length;
    await doc.save();
  }
  return clean(doc);
}

/**
 * Join a funnel by slug with a userId.
 * Enforces capacity and dedupes user.
 */
async function joinFunnel({ slug, userId }) {
  if (!slug) throw new Error('slug is required');
  if (!userId) throw new Error('userId is required');
  await initMongooseOnce();

  if (useMemoryStore) {
    const f = memGet(slug);
    if (!f) throw new Error('Funnel not found');
    if (f.status !== 'filling') throw new Error('Funnel is not accepting entries');
    const entrants = Array.isArray(f.entrants) ? [...f.entrants] : [];
    if (entrants.includes(String(userId))) return clean(f); // already joined
    if (f.capacity && entrants.length >= f.capacity) throw new Error('Funnel is full');

    entrants.push(String(userId));
    return clean(memUpsert({ ...f, entrants, entrantsCount: entrants.length }));
  }

  // Mongo path — atomic upsert with capacity constraint
  const doc = await FunnelModel.findOne({ slug });
  if (!doc) throw new Error('Funnel not found');
  if (doc.status !== 'filling') throw new Error('Funnel is not accepting entries');

  const exists = doc.entrants?.some((u) => String(u) === String(userId));
  if (exists) return clean(doc);

  if (doc.capacity && Number(doc.entrantsCount || doc.entrants.length) >= doc.capacity) {
    throw new Error('Funnel is full');
  }

  doc.entrants = Array.isArray(doc.entrants) ? doc.entrants : [];
  doc.entrants.push(String(userId));
  doc.entrantsCount = doc.entrants.length;
  await doc.save();
  return clean(doc);
}

/**
 * List funnels (lightweight). Use for admin/status pages.
 */
async function listFunnels() {
  await initMongooseOnce();
  if (useMemoryStore) {
    return memList().map(clean);
  }
  const docs = await FunnelModel.find({}).lean(false);
  return docs.map(clean);
}

module.exports = {
  // queries
  getFunnelBySlug,
  listFunnels,

  // mutations
  upsertFunnel,
  joinFunnel,
};