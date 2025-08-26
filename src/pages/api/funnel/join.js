// file: src/pages/api/funnel/join.js
import { dbConnect } from 'lib/dbConnect';
import { ENTRY_FEE_PI, assignStage1Room } from 'lib/funnelService';
import { getPayment, approvePayment } from 'lib/piClient';
import { lobby } from 'lib/funnelLobby';

// ✅ Added: referral rewards util (idempotent + first-paid-action guard)
import { grantReferralRewards } from '../../../lib/referralRewards';

const EXPECTED_FEE = Number(ENTRY_FEE_PI);

// Normalize lots of real-world variants to 'pi'
function normalizeCurrency(raw) {
  if (raw == null) return 'pi';
  const s = String(raw).trim().toLowerCase().replace(/π/g, 'pi');
  if (s === 'pi' || s === 'picoin' || s === 'pi coin') return 'pi';
  return s;
}

export default async function handler(req, res) {
  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await dbConnect();

    const {
      slug,              // not used for stage 1, room is assigned
      userId,
      stage = 1,
      paymentId,         // present when called from Pi.createPayment onReadyForServerApproval
      amount,            // used in fallback dev path
      currency,          // used in fallback dev path
      cycleId = 'default'
    } = req.body || {};

    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const stageNum = Number(stage);
    if (Number.isNaN(stageNum)) {
      return res.status(400).json({ error: 'Invalid stage' });
    }

    if (stageNum !== 1) {
      return res.status(400).json({ error: 'Unsupported stage' });
    }

    // ---------------------------
    // Stage 1 (paid entry)
    // ---------------------------
    if (paymentId) {
      // Pi SDK path: fetch from Pi, validate, approve, stage for confirm.
      const payment = await getPayment(paymentId);
      if (!payment) return res.status(404).json({ error: 'Payment not found' });

      // Be tolerant: Pi servers have returned different shapes historically
      const rawCur =
        payment.currency ??
        payment.currencyCode ??
        payment.currency_name ??
        payment.token ??
        'pi';

      const cur = normalizeCurrency(rawCur);
      if (cur !== 'pi') {
        return res.status(400).json({ error: 'Invalid currency', debug: { cur: rawCur } });
      }

      const amt = Number(payment.amount);
      if (!Number.isFinite(amt)) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      const EPS = 1e-9;
      if (Math.abs(amt - EXPECTED_FEE) > EPS) {
        return res.status(400).json({ error: 'Incorrect amount', debug: { amt, expected: EXPECTED_FEE } });
      }

      // Assign a room now so the UI can show placement immediately.
      const { room, etaSec } = await assignStage1Room(userId, { cycleId });

      // Stage the payment so /confirm can mark it completed (idempotent).
      try {
        lobby.payments.set(paymentId, {
          userId,
          stage: stageNum,
          slug: room.slug || null,
          amount: amt,
          currency: 'pi',
          status: 'approved',
          approvedAt: Date.now(),
        });
      } catch (e) {
        console.error('lobby staging error', e);
      }

      // Approve with Pi server (safe to ignore "already approved" errors).
      try {
        await approvePayment(paymentId);
      } catch (e) {
        console.warn('approvePayment warning', e?.response?.data || e?.message || e);
      }

      // ✅ Qualify the referral ONLY after a successful paid action
      // (grantReferralRewards internally ensures: has referrer, not self, first-paid-action, weekly caps, etc.)
      try {
        await grantReferralRewards(userId);
      } catch (e) {
        // Never block the happy path if referral processing fails
        console.warn('grantReferralRewards warning', e?.message || e);
      }

      return res.status(200).json({
        ok: true,
        stage: 1,
        slug: room.slug,
        entrantsCount: room.entrantsCount,
        status: room.status,
        etaSec,
        paymentId,
      });
    }

    // Dev fallback (no Pi SDK)
    const cur = normalizeCurrency(currency ?? 'pi');
    if (cur !== 'pi') {
      return res.status(400).json({ error: 'Invalid currency' });
    }

    const amt = Number(amount);
    if (!Number.isFinite(amt)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const EPS = 1e-9;
    if (Math.abs(amt - EXPECTED_FEE) > EPS) {
      return res.status(400).json({ error: 'Incorrect amount', debug: { amt, expected: EXPECTED_FEE } });
    }

    const { room, etaSec } = await assignStage1Room(userId, { cycleId });

    // NOTE: Dev fallback path usually shouldn't qualify referrals, because no real payment.
    // If you want it during dev, uncomment:
    // try { await grantReferralRewards(userId); } catch (e) { console.warn('referral (dev) warn', e?.message || e); }

    return res.status(200).json({
      ok: true,
      stage: 1,
      slug: room.slug,
      entrantsCount: room.entrantsCount,
      status: room.status,
      etaSec,
    });
  } catch (err) {
    console.error('POST /api/funnel/join error', err?.response?.data || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
