// src/pages/api/pi/payments/complete.js
import { dbConnect } from '../../../../lib/dbConnect';
import PiPayment from '../../../../models/PiPayment';
import { completePayment } from '../../../../lib/piClient';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  console.log('[complete] HIT body:', req.body);

  const {
    paymentId,
    txid,
    accessToken,
    slug: bodySlug,
    ticketQty: bodyQty,
    userUid: bodyUserUid,
    username: bodyUsername,
    skillQuestion: bodySQ, // { questionId, userAnswer }
    imageUrl,
  } = req.body || {};

  if (!paymentId || !txid) {
    console.warn('[complete] missing fields', { paymentId: !!paymentId, txid: !!txid });
    return res.status(400).json({ ok: false, error: 'missing-fields' });
  }

  try {
    await dbConnect();
    console.log('[complete] DB connected');

    const rec = await PiPayment.findOne({ paymentId });
    if (!rec) {
      console.warn('[complete] unknown paymentId', paymentId);
      return res.status(404).json({ ok: false, error: 'unknown-paymentId' });
    }
    if (rec.status === 'completed') {
      console.log('[complete] already completed', paymentId);
      return res.json({ ok: true, already: true });
    }

    // Finalize on Pi (best effort; don’t block)
    let done = null;
    try {
      done = await completePayment(paymentId, txid, accessToken);
      console.log('[complete] completePayment OK');
    } catch (e) {
      console.warn('[complete] completePayment failed (continuing):', e?.response?.data || e?.message || e);
    }

    // Persist completion locally
    rec.status = 'completed';
    rec.txid = txid;
    if (done) rec.raw = done;

    // ---- Resolve slug & qty from body, memo, or metadata ----
    let compSlug = bodySlug || null;
    let qty = Number(bodyQty || 0);

    const tryReadMemo = (m) => {
      try {
        const j = typeof m === 'string' ? JSON.parse(m) : m;
        return j || {};
      } catch {
        return {};
      }
    };

    const memoObj = tryReadMemo(rec.memo);
    const metaObj = tryReadMemo(rec.metadata || rec.meta);

    if (!compSlug) compSlug = memoObj.slug || metaObj.slug || null;
    if (!qty) qty = Number(memoObj.ticketQty || metaObj.ticketQty || 0);

    // ---- Resolve userUid & username ----
    const userUid =
      bodyUserUid ||
      rec.userUid ||
      rec.user?.uid ||
      rec.user?.userUid ||
      metaObj.userUid ||
      memoObj.userUid ||
      null;

    const username =
      bodyUsername ||
      rec.username ||
      rec.user?.username ||
      metaObj.username ||
      memoObj.username ||
      null;

    // ---- Resolve skillQuestion ----
    const skillQuestion =
      bodySQ ||
      metaObj.skillQuestion ||
      memoObj.skillQuestion ||
      null;

    await rec.save();
    console.log('[complete] payment saved', { paymentId, compSlug, qty, userUid, username });

    // Validate required downstream inputs
    if (!compSlug || !qty || !userUid || !username) {
      return res.status(400).json({
        ok: false,
        error: 'missing-required-for-ticketing',
        detail: { compSlug: !!compSlug, qty: !!qty, userUid: !!userUid, username: !!username },
      });
    }
    if (!skillQuestion?.questionId || !skillQuestion?.userAnswer) {
      return res.status(400).json({
        ok: false,
        error: 'missing-skill-question',
        detail: 'Provide { questionId, userAnswer }',
      });
    }

    // ---- Create tickets via our dedicated endpoint ----
    const proto = String(req.headers['x-forwarded-proto'] || '');
    const host  = String(req.headers['x-forwarded-host']  || req.headers.host || '');
    const base  = (proto && host)
      ? `${proto}://${host}`
      : (req.headers.origin || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

    console.log('[complete] -> calling create-from-payment', {
      base, compSlug, qty, userUid, username,
      hasSQ: !!(skillQuestion && skillQuestion.questionId && skillQuestion.userAnswer),
    });

    let ticketing;
    try {
      const r = await axios.post(
        `${base}/api/tickets/create-from-payment`,
        {
          paymentId,
          userUid,
          username,
          competitionSlug: compSlug,
          ticketQuantity: Number(qty),
          skillQuestionData: {
            questionId: skillQuestion.questionId,
            userAnswer: skillQuestion.userAnswer,
          },
          imageUrl,
        },
        { timeout: 15000 }
      );
      ticketing = r.data;
      console.log('[complete] tickets/create-from-payment OK');
    } catch (err) {
      console.error('[complete] tickets/create-from-payment FAILED', err?.response?.data || err?.message || err);
      return res.status(502).json({ ok: false, error: 'ticketing-failed', detail: err?.response?.data || null });
    }

    // IMPORTANT: Do NOT manually $inc ticketsSold here.
    // The writer endpoint handles atomic reservation + increment.

    return res.status(200).json({ ok: true, payment: done || null, ticketing });
  } catch (e) {
    console.error('[api/pi/payments/complete] error:', e?.response?.data || e);
    return res.status(500).json({ ok: false, error: 'complete-failed' });
  }
}
