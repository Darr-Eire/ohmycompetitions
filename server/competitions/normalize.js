const PLACEHOLDER_IMG = '/images/placeholder.jpg';

const toNum = (v, d = 0) => {
  if (v == null) return d;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v.replace(/[^\d.,-]/g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : d;
  }
  return d;
};

// Fold daily/weekly into "dailyweekly" for the UI tabs
const foldTheme = (raw) => {
  const t = String(raw || '').toLowerCase().trim();
  if (t === 'daily' || t === 'weekly') return 'dailyweekly';
  if (['tech','launch','dailyweekly','pi','stages','free'].includes(t)) return t;
  return ''; // unknown → let client keyword fallback decide
};

export function normalizeCompetition(db) {
  const prizePi = db.prizePi ?? null;
  const prize   = db.prizeLabel ?? (prizePi ? `${prizePi} π` : '');

  return {
    _id: String(db.id ?? db._id ?? db.slug),
    slug: String(db.slug),
    title: String(db.title),
    prize,
    prizePi: prizePi == null ? null : toNum(prizePi, null),
    pricePi: toNum(db.entryFeePi ?? db.pricePi ?? db.entryFee, 0),
    totalTickets: toNum(db.totalTickets, 0),
    ticketsSold: toNum(db.ticketsSold, 0),
    maxPerUser: toNum(db.maxPerUser, 0),
    startsAt: db.startsAt ? new Date(db.startsAt).toISOString() : null,
    endsAt:   db.endsAt   ? new Date(db.endsAt).toISOString()   : null,
    imageUrl: db.imageUrl || PLACEHOLDER_IMG,
    tags: Array.isArray(db.tags) ? db.tags.map(String) : [],
    theme: foldTheme(db.theme),
    freeEntryUrl: db.freeEntryUrl || null,
    status: db.status || 'active',
  };
}
