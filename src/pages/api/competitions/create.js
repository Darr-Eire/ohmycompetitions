import { dbConnect } from 'lib/dbConnect';
import Competition from 'models/Competition';
import { requireAdmin } from 'lib/adminAuth';

// POST /api/competitions/create
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Admin-only via Authorization: Bearer <ADMIN_BEARER_TOKEN>
  if (!requireAdmin(req, res)) return;

  try {
    await dbConnect();

    const {
      // top-level
      title,
      description = '',
      prize,
      prizeBreakdown = [],      // array of strings like ["6000","3000","1000"]
      theme,                    // e.g. "pi", "tech"
      imageUrl = '',
      thumbnail = '',
      href = '',

      // comp.* fields (required by your schema)
      slug,                     // competition slug
      entryFee,                 // number
      totalTickets,             // number
      ticketsSold = 0,          // number
      prizePool = 0,            // number
      startsAt = null,
      endsAt = null,
      location = 'Online Global Draw',
      paymentType = 'pi',       // "pi" | "free"
      piAmount,                 // if omitted and paymentType === 'pi', default to entryFee
      status = 'active',        // "active" | "completed" | "cancelled"
      maxPerUser,               // REQUIRED by schema
      winnersCount,             // REQUIRED by schema
    } = req.body || {};

    // Basic validation aligned to your schema
    const errs = [];
    if (!title) errs.push('title');
    if (!slug) errs.push('slug');
    if (typeof entryFee !== 'number') errs.push('entryFee(number)');
    if (typeof totalTickets !== 'number') errs.push('totalTickets(number)');
    if (!prize) errs.push('prize');
    if (!theme) errs.push('theme');
    if (typeof maxPerUser !== 'number' || maxPerUser < 1) errs.push('maxPerUser(number>=1)');
    if (typeof winnersCount !== 'number' || winnersCount < 1) errs.push('winnersCount(number>=1)');

    if (errs.length) {
      return res.status(400).json({ error: `Missing/invalid fields: ${errs.join(', ')}` });
    }

    // Normalize slug
    const normalizedSlug = String(slug)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Uniqueness by comp.slug
    const exists = await Competition.findOne({ 'comp.slug': normalizedSlug }).select('_id').lean();
    if (exists) {
      return res.status(409).json({ error: 'Competition slug already exists' });
    }

    const doc = {
      title,
      description,
      prizeBreakdown: Array.isArray(prizeBreakdown) ? prizeBreakdown.slice(0, 10) : [],
      prize,
      href,
      theme,
      imageUrl,
      thumbnail,
      comp: {
        slug: normalizedSlug,
        entryFee: Number(entryFee),
        totalTickets: Number(totalTickets),
        ticketsSold: Number(ticketsSold) || 0,
        prizePool: Number(prizePool) || 0,
        startsAt: startsAt || null,
        endsAt: endsAt || null,
        location,
        paymentType,
        piAmount: paymentType === 'pi'
          ? Number(piAmount ?? entryFee)
          : 0,
        status,
        maxPerUser: Number(maxPerUser),
        winnersCount: Number(winnersCount),
      },
    };

    const created = await Competition.create(doc);
    return res.status(201).json({
      ok: true,
      id: String(created._id),
      slug: created.comp.slug,
    });
  } catch (err) {
    console.error('competitions/create error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
