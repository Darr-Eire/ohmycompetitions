// src/pages/api/admin/competitions/index.js
import { dbConnect } from '../../../../lib/dbConnect';
import Competition from '../../../../models/Competition';

export default async function handler(req, res) {
  try {
    await dbConnect();

    /* ----------------------------- GET: list all ----------------------------- */
    if (req.method === 'GET') {
      const competitions = await Competition.find({})
        .sort({ createdAt: -1 })
        .lean();
      return res.status(200).json(competitions);
    }

    /* ---------------------------- POST: create one --------------------------- */
    if (req.method === 'POST') {
      const body = req.body || {};
      console.log('📥 Admin create body:', JSON.stringify(body, null, 2));


      // Uncomment to debug incoming payload:
      // console.log('📥 Admin create body:', JSON.stringify(body, null, 2));

      /* ---------- Normalize prizes into a single array (prizeBreakdown) ------ */
      const prizeBreakdown = Array.isArray(body.prizeBreakdown)
        ? body.prizeBreakdown
        : Array.isArray(body.prizes)
        ? body.prizes
        : [];

      // Accept winners count from winnersCount (new), numberOfWinners (legacy), or nested comp
      const rawWinnersCount =
        body.winnersCount ??
        body.numberOfWinners ??
        body.comp?.winnersCount;

      /* --------------------------- Pull string fields ------------------------ */
      const slug = body.slug ?? body.comp?.slug;
      const title = body.title;
      const prize = body.prize ?? (prizeBreakdown[0] ?? '');
      const theme = body.theme;

      // Strings can come flat or nested (comp.*)
      const startsAt =
        (body.startsAt ?? body.comp?.startsAt ?? '').trim();
      const endsAt =
        (body.endsAt ?? body.comp?.endsAt ?? '').trim();
      const location =
        (body.location ?? body.comp?.location ?? 'Online Global Draw').trim();
      const imageUrl = (body.imageUrl ?? '').trim() || '/images/your.png';
      const thumbnail =
        (body.thumbnail && String(body.thumbnail).trim()) || null;
      const description = body.description || '';

      /* -------------------------- Basic validations ------------------------- */
      if (!slug || !title || (!prize && prizeBreakdown.length === 0)) {
        return res.status(400).json({
          message:
            'Missing required: slug, title, and a prize (prize or prizeBreakdown[])',
        });
      }

      // Unique slug (stored under comp.slug)
      const exists = await Competition.findOne({ 'comp.slug': slug });
      if (exists) {
        return res.status(409).json({
          message: `Competition with slug "${slug}" already exists.`,
        });
      }

      /* ---------------------- Numbers (accept both shapes) ------------------- */
      const asNum = (v) =>
        v === '' || v === null || v === undefined ? NaN : Number(v);

      const entryFee = asNum(body.entryFee ?? body.comp?.entryFee);
      const totalTickets = asNum(
        body.totalTickets ?? body.comp?.totalTickets
      );
      const piAmount = asNum(body.piAmount ?? body.comp?.piAmount);
      const maxPerUser = asNum(
        body.maxPerUser ?? body.comp?.maxPerUser
      );
      const winnersCount = asNum(rawWinnersCount);

      // Validations
      if (!Number.isFinite(entryFee) || entryFee < 0) {
        return res
          .status(400)
          .json({ message: 'entryFee must be a number ≥ 0' });
      }
      if (!Number.isFinite(totalTickets) || totalTickets < 1) {
        return res
          .status(400)
          .json({ message: 'totalTickets must be a number ≥ 1' });
      }
      if (!Number.isFinite(maxPerUser) || maxPerUser < 1) {
        return res
          .status(400)
          .json({ message: 'maxPerUser must be a number ≥ 1' });
      }
      if (!Number.isFinite(winnersCount) || winnersCount < 1) {
        return res
          .status(400)
          .json({ message: 'winnersCount must be a number ≥ 1' });
      }

      /* ------------------------- Build & create doc ------------------------- */
      const competition = await Competition.create({
        comp: {
          slug,
          entryFee,
          totalTickets,
          ticketsSold: 0,
          prizePool: 0, // compute if you wish
          // Keep as strings to match your schema
          startsAt,
          endsAt,
          location,
          paymentType: entryFee > 0 ? 'pi' : 'free',
          piAmount: Number.isFinite(piAmount) ? piAmount : entryFee,
          status: 'active',

          // New required fields
          maxPerUser,
          winnersCount,
        },

        title,
        description,
        prize,                   // legacy single-line
        prizeBreakdown,          // multi-line prizes
        href: `/competitions/${slug}`,
        theme: theme || 'tech',
        imageUrl,
        thumbnail,
      });

      return res.status(201).json(competition);
    }

    /* --------------------------- DELETE: by id ------------------------------ */
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ message: 'Missing id' });

      await Competition.findByIdAndDelete(id);
      return res
        .status(200)
        .json({ message: 'Competition deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('❌ Admin competitions API error:', error);

    if (error?.code === 11000) {
      const duplicateField = error.keyValue || {};
      return res.status(409).json({
        message: `Duplicate entry for ${Object.keys(duplicateField)[0]}`,
        field: Object.keys(duplicateField)[0],
        value: Object.values(duplicateField)[0],
      });
    }

    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
}
