// pages/api/admin/vouchers/generate.js
import { dbConnect } from '../../../../lib/dbConnect';
import Voucher from '../../../../models/Voucher';
import { generateHumanCode, hashCode } from '../../../../lib/vouchers';
import { requireAdmin } from '../_adminAuth';

function isAdmin(req) {
  const admin = requireAdmin(req, {});
  return admin !== false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });

  const {
    count = 1,
    competitionSlug,
    ticketCount = 1,
    maxRedemptions = 1,
    perUserLimit = 1,
    expiresAt = null,
    assignedToUserId = null,
    batchId = `batch_${Date.now()}`,
    notes = ''
  } = req.body || {};

  if (!competitionSlug) return res.status(400).json({ error: 'competitionSlug required' });
  if (count > 1000) return res.status(400).json({ error: 'count too large (max 1000)' });

  await dbConnect();

  const created = [];
  for (let i = 0; i < Number(count); i++) {
    const code = generateHumanCode();
    const doc = await Voucher.create({
      codeHash: hashCode(code),
      codeDisplay: code,
      batchId,
      competitionSlug,
      ticketCount,
      maxRedemptions,
      perUserLimit,
      assignedToUserId: assignedToUserId || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: 'admin',
      notes,
    });
    created.push({ id: doc._id.toString(), code, competitionSlug, ticketCount, expiresAt });
  }

  res.json({ ok: true, batchId, vouchers: created });
}
