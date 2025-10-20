// file: src/pages/api/funnel/join.js
import { dbConnect } from 'lib/dbConnect';
import { getPayment, approvePayment } from 'lib/piClient';
import { lobby } from 'lib/funnelLobby';

// Fallbacks; overridden if funnelService is present
let ENTRY_FEE_PI = 1; // default 1π
let assignStage1Room = async (userId) => ({
  room: { slug: null, entrantsCount: 0, status: 'pending' },
  etaSec: 0,
});

// Try to load funnel service (non-fatal)
try {
  const funnelService = require('../../../lib/funnelService');
  if (typeof funnelService.ENTRY_FEE_PI !== 'undefined') ENTRY_FEE_PI = funnelService.ENTRY_FEE_PI;
  if (typeof funnelService.assignStage1Room === 'function') assignStage1Room = funnelService.assignStage1Room;
} catch {
  console.warn('⚠ funnelService not found, using fallbacks');
}

// Optional referral rewards (non-fatal)
let grantReferralRewards = async () => {};
try {
  const rr = require('../../../lib/referralRewards');
  if (typeof rr.grantReferralRewards === 'function') grantReferralRewards = rr.grantReferralRewards;
} catch {
  console.warn('⚠ referralRewards not found, skipping referral bonus');
}

const EXPECTED_FEE = Number(ENTRY_FEE_PI);

// Normalize lots of real-world variants to 'pi'
function normalizeCurrency(raw) {
  if (raw == null) return 'pi';
  const s = String(raw).trim().toLowerCase().replace(/π/g, 'pi');
  if (s === 'pi' || s === 'picoin' || s === 'pi coin') return 'pi';
  return s;
}

export default async function handler(req, res) {
  // CORS (simple)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await dbConnect();

    const {
      userId,
      stage = 1,
      paymentId,
      amount,
      currency,
      cycleId = 'default',
    } = req.body || {};

    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const stageNum = Number(stage);
    if (!Number.isFinite(stageNum) || stageNum !== 1) {
      return res.status(400).json({ error: 'Unsupported or invalid stage' });
    }

    // ---------------------------
    // Stage 1 (paid entry)
    // ---------------------------
    if (paymentId) {
      // 1) Read Payment from Pi Platform
      const payment = await getPayment(paymentId);
      if (!payment) return res.status(404).json({ error: 'Payment not found' });

      // Defensive extraction from possible DTO variants
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

      // 2) Place user into a Stage 1 room
      const { room, etaSec } = await assignStage1Room(userId, { cycleId });

      // 3) Stage the payment in memory (best-effort)
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

      // 4) Approve on Platform (idempotent-safe)
      try {
        const alreadyApproved =
          payment?.status?.developer_approved === true ||
          payment?.status?.developer_approved === 'true';

        if (!alreadyApproved) {
          await approvePayment(paymentId);
        } else {
          console.log('ℹ payment already developer_approved, skipping approve');
        }
      } catch (e) {
        console.warn('approvePayment warning', e?.response?.data || e?.message || e);
      }

      // 5) Referral rewards (non-blocking)
      try {
        await grantReferralRewards(userId);
      } catch (e) {
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

    // ---------------------------
    // Dev fallback (no Pi SDK)
    // ---------------------------
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
