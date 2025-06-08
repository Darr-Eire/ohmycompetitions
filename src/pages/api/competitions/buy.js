import { dbConnect } from '../../../lib/dbConnect';
import Competition from '../../../models/Competition';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, quantity } = req.body;

  if (
    !slug ||
    !quantity ||
    typeof quantity !== 'number' ||
    quantity <= 0
  ) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  await connectToDatabase();

  try {
    // Find the competition
    const competition = await Competition.findOne({ slug });
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    // Prevent overselling tickets
    const newTicketsSold = competition.ticketsSold + quantity;
    if (newTicketsSold > competition.totalTickets) {
      return res.status(400).json({ error: 'Not enough tickets available' });
    }

    // Atomically increment ticketsSold
    const updated = await Competition.findOneAndUpdate(
      { slug },
      { $inc: { ticketsSold: quantity } },
      { new: true }
    );

    return res.status(200).json({
      message: 'Tickets updated successfully',
      ticketsSold: updated.ticketsSold,
    });
  } catch (error) {
    console.error('Error updating tickets:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
