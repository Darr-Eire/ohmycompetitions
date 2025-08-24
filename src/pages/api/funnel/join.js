// file: src/pages/api/funnel/join.js
import { dbConnect } from '../../../lib/dbConnect';
import { ENTRY_FEE_PI, assignStage1Room } from '../../../lib/funnelService';
import { getPayment, approvePayment } from '../../../lib/piClient';
import { lobby } from '../../../lib/funnelLobby';

const EXPECTED_FEE = Number(ENTRY_FEE_PI);
const EPS = 1e-9;

// Normalize lots of real-world variants to 'pi'
function normalizeCurrency(raw) {
  if (raw == null) return 'pi';
  const s = String(raw).trim().toLowerCase().replace(/π/g, 'pi');
  if (s === 'pi' || s === 'picoin' || s === 'pi coin') return 'pi';
  return s;
}

export default async function handler(req, res) {
  // CORS + cache
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await dbConnect();

    const {
      slug,              // not used for stage 1; room is assigned server-side
      userId,
      username = null,   // carry username to store alongside userId
      stage = 1,
      paymentId,         // present when called from Pi.createPayment onReadyForServerApproval
      amount,            // used in fallback dev path
      currency,          // used in fallback dev path
      cycleId = 'default'
    } = req.body || {};

    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const stageNum = Number(stage);
    if (!Number.isFinite(stageNum) || stageNum !== 1) {
      return res.status(400).json({ error: 'Unsupported or invalid stage' });
    }

    // ---------------------------
    // Stage 1 (paid entry via Pi)
    // ---------------------------
    if (paymentId) {
      // Idempotency: if we already staged this payment, just return the same placement
      const stagedExisting = lobby?.payments?.get?.(paymentId);
      if (stagedExisting?.status === 'approved' || stagedExisting?.status === 'completed') {
        return res.status(200).json({
          ok: true,
          stage: 1,
          slug: stagedExisting.slug || null,
          entrantsCount: stagedExisting.entrantsCount ?? null,
          status: stagedExisting.status || 'approved',
          etaSec: stagedExisting.etaSec ?? null,
          paymentId,
          idempotent: true,
        });
      }

      // 1) Verify payment with Pi
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
      if (!Number.isFinite(amt)) return res.status(400).json({ error: 'Invalid amount' });
      if (Math.abs(amt - EXPECTED_FEE) > EPS) {
        return res.status(400).json({
          error: 'Incorrect amount',
          debug: { amt, expected: EXPECTED_FEE, paymentId }
        });
      }

      // 2) Assign a room and approve payment in parallel, but NEVER fail on approve
      let assignment;
      try {
        const approveP = approvePayment(paymentId).catch((e) => {
          const payload = e?.response?.data || e;
          if (payload?.error === 'already_approved') {
            console.warn('approvePayment: already approved', payload);
            return null;
          }
          console.warn('approvePayment warning', payload);
          return null;
        });

        const assignP = assignStage1Room({ userId, username }, { cycleId });

        [assignment] = await Promise.all([assignP, approveP]);
      } catch (e) {
        // Shouldn't happen, but keep soft guard
        console.error('join: parallel step failed', e?.response?.data || e);
      }

      // assignment shape: { stage, roomSlug, capacity, advancing, entrantsCount, status }
      const slugAssigned  = assignment?.roomSlug || null;
      const entrantsCount = assignment?.entrantsCount ?? null;
      const status        = assignment?.status || 'approved';
      const etaSec        = null;

      // 3) Stage the payment so /confirm can mark it completed (idempotent).
      try {
        lobby.payments.set(paymentId, {
          userId,
          stage: stageNum,
          slug: slugAssigned,
          amount: amt,
          currency: 'pi',
          status: 'approved',
          approvedAt: Date.now(),
          entrantsCount,
          etaSec,
        });
      } catch (e) {
        console.error('lobby staging error', e);
      }

      return res.status(200).json({
        ok: true,
        stage: 1,
        slug: slugAssigned,
        entrantsCount,
        status,
        etaSec,
        paymentId,
      });
    }

    // ---------------------------
    // Dev fallback (no Pi SDK)
    // ---------------------------
    const cur = normalizeCurrency(currency ?? 'pi');
    if (cur !== 'pi') return res.status(400).json({ error: 'Invalid currency' });

    const amt = Number(amount);
    if (!Number.isFinite(amt)) return res.status(400).json({ error: 'Invalid amount' });
    if (Math.abs(amt - EXPECTED_FEE) > EPS) {
      return res.status(400).json({ error: 'Incorrect amount', debug: { amt, expected: EXPECTED_FEE } });
    }

    const assignment = await assignStage1Room({ userId, username }, { cycleId });

    return res.status(200).json({
      ok: true,
      stage: 1,
      slug: assignment.roomSlug,
      entrantsCount: assignment.entrantsCount,
      status: assignment.status,
      etaSec: null,
    });
  } catch (err) {
    console.error('POST /api/funnel/join error', err?.response?.data || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
