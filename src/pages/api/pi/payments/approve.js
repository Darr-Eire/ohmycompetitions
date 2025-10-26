// src/pages/api/pi/payments/approve.js
import { dbConnect } from '../../../../lib/dbConnect';
import PiPayment from '../../../../models/PiPayment';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ ok: false, error: 'method-not-allowed' });


  try {
    await dbConnect();

    const {
      paymentId,
      slug,
      ticketQty,
      userUid,
      username,
      skillQuestion, // { questionId, userAnswer }
      imageUrl,
    } = req.body || {};

    log('HIT body:', { paymentId, slug, ticketQty, userUid, username });

    // ─────────────────────── Validation ───────────────────────
    if (!paymentId || !slug || !ticketQty || !userUid || !username) {
      return res.status(400).json({
        ok: false,
        error: 'missing-fields',
        missing: {
          paymentId: !!paymentId,
          slug: !!slug,
          ticketQty: !!ticketQty,
          userUid: !!userUid,
          username: !!username,
        },
      });
    }

    if (!skillQuestion?.questionId || !skillQuestion?.userAnswer) {
      return res.status(400).json({
        ok: false,
        error: 'missing-skill-question',
        detail: 'Provide { questionId, userAnswer }',
      });
    }

    // ─────────────────────── Payment record ───────────────────────
    const rec = await PiPayment.findOne({ paymentId });
    if (!rec) {
      return res.status(404).json({ ok: false, error: 'unknown-paymentId' });
    }

    // Idempotency: skip if already done
    if (rec.status === 'approved' || rec.status === 'completed') {
      log('already approved/completed', paymentId);
      return res.status(200).json({ ok: true, already: true });
    }

    // ─────────────────────── Mark as approved ───────────────────────
    rec.status = 'approved';
    rec.metadata = {
      ...(rec.metadata || {}),
      slug,
      ticketQty: Number(ticketQty),
      userUid,
      username,
      skillQuestion,
    };
    await rec.save();
    log('payment saved as approved');

    // ─────────────────────── Create tickets ───────────────────────
    // Build correct base (avoid HTTPS on localhost)
    const forwardedProto = (req.headers['x-forwarded-proto'] || '')
      .split(',')[0]
      .trim();
    const hostHeader =
      req.headers['x-forwarded-host'] ||
      req.headers.host ||
      'localhost:3000';
    let base = `${forwardedProto || 'http'}://${hostHeader}`;
    if (/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(hostHeader)) {
      base = `http://${hostHeader}`;
    }

    let ticketing;
    try {
      const r = await axios.post(
        `${base}/api/tickets/create-from-payment`,
        {
          paymentId,
          userUid,
          username,
          competitionSlug: slug,
          ticketQuantity: Number(ticketQty),
          skillQuestionData: {
            questionId: skillQuestion.questionId,
            userAnswer: skillQuestion.userAnswer,
          },
          imageUrl,
        },
        { timeout: 15000 }
      );
      ticketing = r.data;
      log('ticketing ok', { count: ticketing?.count });
    } catch (e) {
      const data = e?.response?.data;
      const status = e?.response?.status;
      console.error('[approve] ticketing error:', status, data || e?.message || e);
      return res.status(502).json({
        ok: false,
        error: 'ticketing-failed',
        status,
        detail: data || e?.message || 'unknown-error',
      });
    }

    // ─────────────────────── Response ───────────────────────
    return res.status(200).json({ ok: true, approved: true, ticketing });
  } catch (e) {
    console.error('[approve] fatal:', e?.stack || e);
    return res
      .status(500)
      .json({
        ok: false,
        error: 'approve-failed',
        detail: e?.message || 'internal-error',
      });
  }
}
