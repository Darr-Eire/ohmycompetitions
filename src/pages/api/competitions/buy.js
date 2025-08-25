// file: src/pages/api/competitions/tickets/increment.js
import { dbConnect } from '../../../../lib/dbConnect';
import Competition from '../../../../models/Competition';

/**
 * POST /api/competitions/tickets/increment
 * Body: { slug: string, quantity: number }
 *
 * Atomically increments ticketsSold by `quantity` IF ticketsSold + quantity <= totalTickets.
 * Returns the new ticketsSold and remaining tickets.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
  } catch (e) {
    console.error('DB connect error', e);
    return res.status(500).json({ error: 'Database connection error' });
  }

  try {
    const { slug, quantity } = req.body || {};

    // Basic validation
    if (typeof slug !== 'string' || !slug.trim()) {
      return res.status(400).json({ error: 'Invalid slug' });
    }
    if (
      typeof quantity !== 'number' ||
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    // Ensure integer quantity
    const qty = Math.floor(quantity);
    if (qty !== quantity) {
      // If fractional was passed, reject; or you could auto-floor.
      return res.status(400).json({ error: 'Quantity must be an integer' });
    }

    // Use a single atomic update with an $expr guard so we never oversell.
    // Condition: ticketsSold <= totalTickets - qty
    // If condition fails, `updated` will be null.
    const updated = await Competition.findOneAndUpdate(
      {
        slug: slug.trim(),
        $expr: {
          $lte: [
            '$ticketsSold',
            { $subtract: ['$totalTickets', qty] }
          ]
        }
      },
      { $inc: { ticketsSold: qty } },
      { new: true, projection: { ticketsSold: 1, totalTickets: 1, _id: 0 } }
    );

    if (!updated) {
      // Either competition not found or not enough tickets remaining
      // Determine which to return a clearer message
      const exists = await Competition.findOne({ slug: slug.trim() })
        .select({ ticketsSold: 1, totalTickets: 1 })
        .lean();

      if (!exists) {
        return res.status(404).json({ error: 'Competition not found' });
      }

      const remaining = Math.max(0, (exists.totalTickets || 0) - (exists.ticketsSold || 0));
      return res.status(400).json({
        error: 'Not enough tickets available',
        remaining
      });
    }

    const remaining = Math.max(0, (updated.totalTickets || 0) - (updated.ticketsSold || 0));

    return res.status(200).json({
      message: 'Tickets updated successfully',
      ticketsSold: updated.ticketsSold,
      remaining
    });
  } catch (error) {
    console.error('Error updating tickets:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
