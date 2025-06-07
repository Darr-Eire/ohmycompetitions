import dbConnect from '../../../lib/dbConnect';
import Competition from '../../../models/Competition';


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, quantity } = req.body;

  if (!slug || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  await dbConnect();

  try {
    // Increment ticketsSold atomically
    const updated = await Competition.findOneAndUpdate(
      { slug },
      { $inc: { ticketsSold: quantity } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    return res.status(200).json({ message: 'Tickets updated', ticketsSold: updated.ticketsSold });
  } catch (error) {
    console.error('Error updating tickets:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
