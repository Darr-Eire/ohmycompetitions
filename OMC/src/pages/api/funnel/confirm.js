// file: src/pages/api/funnel/confirm.js
import { lobby } from '../../../lib/funnelLobby';

// Simple per-stage fee map (adjust if you change pricing)
const ENTRY_FEES_PI = {
  1: 0.15,
  // 2+: ticket use, no new payment expected
};

function normalizeCurrency(raw) {
  if (raw == null) return 'pi';
  const s = String(raw).trim().toLowerCase().replace(/π/g, 'pi');
  if (s === 'pi' || s === 'picoin' || s === 'pi coin') return 'pi';
  return s;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      slug,
      userId,
      stage,
      paymentId,
      txId,
      amount,     // optional but we validate if present
      currency,   // optional; defaults to 'pi'
    } = req.body || {};

    const stageNum = Number(stage);
    if (!userId || !paymentId || Number.isNaN(stageNum)) {
      return res.status(400).json({ error: 'Missing or invalid fields: userId, paymentId, stage' });
    }

    // Currency / amount normalization + checks
    const cur = normalizeCurrency(currency);
    if (cur !== 'pi') {
      return res.status(400).json({ error: 'Invalid currency', debug: { currency } });
    }

    let amtNum = null;
    if (amount != null) {
      amtNum = Number(amount);
      if (Number.isNaN(amtNum)) {
        return res.status(400).json({ error: 'Amount must be a number' });
      }
    }

    const expected = ENTRY_FEES_PI[stageNum];
    if (expected != null && amtNum != null) {
      const EPS = 1e-9;
      if (Math.abs(amtNum - expected) > EPS) {
        return res.status(400).json({ error: 'Incorrect amount for this stage', debug: { amtNum, expected } });
      }
    }

    // Lookup payment recorded during /join
    const rec = lobby?.payments?.get(paymentId);
    if (!rec) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (rec.status === 'completed') {
      return res.status(200).json({
        ok: true,
        idempotent: true,
        paymentId,
        txId: rec.txId || txId || null,
        slug: rec.slug ?? slug ?? null,
        stage: rec.stage ?? stageNum,
        currency: rec.currency ?? cur,
        amount: rec.amount ?? amtNum,
      });
    }

    lobby.payments.set(paymentId, {
      ...rec,
      status: 'completed',
      txId: txId || rec.txId || null,
      confirmedAt: Date.now(),
      slug: rec.slug ?? slug ?? null,
      stage: rec.stage ?? stageNum,
      currency: cur,
      amount: amtNum ?? rec.amount ?? null,
    });

    return res.status(200).json({
      ok: true,
      paymentId,
      txId: txId || null,
      slug: rec.slug ?? slug ?? null,
      stage: stageNum,
      currency: cur,
      amount: amtNum,
    });
  } catch (err) {
    console.error('POST /api/funnel/confirm error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
