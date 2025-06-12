import { dbConnect } from 'lib/dbConnect'; // ✅ Corrected import to match named export
import Ticket from 'models/Ticket';
import User from 'models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Missing email' });
  }

  try {
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tickets = await Ticket.find({ userId: user._id });

    const formattedTickets = tickets.map((ticket) => ({
      competitionTitle: ticket.competitionTitle,
      quantity: ticket.quantity,
      purchasedAt: ticket.purchasedAt,
      ticketNumbers: ticket.ticketNumbers,
    }));

    return res.status(200).json(formattedTickets);
  } catch (err) {
    console.error('❌ Error fetching tickets:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
}
