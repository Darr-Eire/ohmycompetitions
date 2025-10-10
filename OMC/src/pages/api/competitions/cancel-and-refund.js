// src/pages/api/competitions/cancel-and-refund.js
import { dbConnect } from 'lib/dbConnect';
import Competition from 'models/Competition';
import Payment from 'models/Payment';
import TicketCredit from 'models/TicketCredit';
import { requireAdmin } from '../admin/_adminAuth';

/* ---------------------------- helpers ---------------------------- */
function resolveCompSlug(comp) {
  return comp?.comp?.slug || comp?.slug || String(comp?._id || '');
}

function resolveUserIdFromPayment(p) {
  // Prefer a canonical id; fall back safely to username
  return p?.userId || p?.piUserId || p?.username || null;
}

/* --------------------------------- API --------------------------------- */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    await dbConnect();

    const {
      competitionId,
      slug,
      mode = 'credit',       // 'credit' (recommended) or 'pi' (placeholder)
      dryRun: bodyDryRun,
      reason = 'Admin cancellation',
    } = req.body || {};

    const queryDryRun = req.query?.dryRun === '1';
    const dryRun = !!(bodyDryRun || queryDryRun);

    // Resolve competition by id or slug
    let comp = null;
    if (competitionId) {
      comp = await Competition.findById(competitionId).lean();
    } else if (slug) {
      comp = await Competition.findOne({ 'comp.slug': slug }).lean();
    } else {
      return res.status(400).json({ error: 'Provide competitionId or slug' });
    }
    if (!comp) return res.status(404).json({ error: 'Competition not found' });

    const compSlug = resolveCompSlug(comp);

    // List completed payments for this competition
    const payments = await Payment.find({
      competitionSlug: compSlug,
      status: 'completed',
    }).lean();

    // --- DRY RUN: just return a preview of impact
    if (dryRun) {
      const impactedUsers = Array.from(
        new Set(
          payments
            .map((p) => resolveUserIdFromPayment(p))
            .filter(Boolean)
        )
      );
      return res.status(200).json({
        ok: true,
        mode,
        dryRun: true,
        competitionId: comp._id,
        slug: compSlug,
        count: payments.length,
        users: impactedUsers,
        message: 'Preview only — no changes applied.',
      });
    }

    // Mark competition as cancelled (non-blocking; do before issuing refunds)
    await Competition.updateOne(
      { _id: comp._id },
      { $set: { 'comp.status': 'cancelled' } }
    );

    // No payments? All done.
    if (!payments.length) {
      return res.status(200).json({
        ok: true,
        mode,
        competitionId: comp._id,
        slug: compSlug,
        count: 0,
        refunds: [],
        message: 'No completed payments to refund.',
      });
    }

    if (mode === 'credit') {
      // Build TicketCredit docs
      const docs = [];
      const skipped = [];

      for (const p of payments) {
        const userId = resolveUserIdFromPayment(p);
        if (!userId) {
          skipped.push({ paymentId: p.paymentId || String(p._id), reason: 'missing userId' });
          continue;
        }

        const quantity = Number(p.ticketQuantity ?? p.quantity ?? 1) || 1;

        docs.push({
          userId,                    // schema: String, required
          username: p.username || null,
          competitionSlug: compSlug, // schema: String, required
          quantity,                  // schema: Number, min:1
          source: 'admin-grant',     // enum includes 'admin-grant'
          reason: 'competition_refund',
          grantedBy: admin?.username || 'system',
          meta: {
            paymentId: p.paymentId || String(p._id),
            amount: p.amount,
            originalStatus: p.status,
            cancelReason: reason,
          },
        });
      }

      if (!docs.length) {
        return res.status(200).json({
          ok: true,
          mode,
          competitionId: comp._id,
          slug: compSlug,
          count: 0,
          refunds: [],
          ...(skipped.length ? { skipped } : {}),
          message: 'No credits created (all payments missing userId).',
        });
      }

      // Insert credits; tolerate a few invalid docs
      const inserted = await TicketCredit.insertMany(docs, { ordered: false });

      const refunds = inserted.map((c) => ({
        type: 'credit',
        username: c.username,
        userId: c.userId,
        qty: c.quantity,
        creditId: String(c._id),
      }));

      return res.status(200).json({
        ok: true,
        mode,
        competitionId: comp._id,
        slug: compSlug,
        count: refunds.length,
        refunds,
        ...(skipped.length ? { skipped } : {}),
        message: 'Credits issued via admin-grant.',
      });
    }

    // mode === 'pi' — placeholder queue (no on-chain send here)
    const refunds = payments.map((p) => ({
      type: 'pi_refund_pending',
      username: p.username,
      userId: resolveUserIdFromPayment(p),
      amount: p.amount,
      paymentId: p.paymentId || String(p._id),
    }));

    return res.status(200).json({
      ok: true,
      mode,
      competitionId: comp._id,
      slug: compSlug,
      count: refunds.length,
      refunds,
      message: 'Pi payout pending (manual/on-chain integration required).',
    });
  } catch (e) {
    console.error('cancel-and-refund error', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
