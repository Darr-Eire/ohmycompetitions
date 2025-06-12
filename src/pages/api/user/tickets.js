import { connectToDatabase } from 'lib/dbConnect';import Ticket from 'models/Ticket';
import User from 'models/User';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Missing email' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tickets = await Ticket.find({ userId: user._id });

    const formattedTickets = tickets.map(ticket => ({
      competitionTitle: ticket.competitionTitle,
      quantity: ticket.quantity,
      purchasedAt: ticket.purchasedAt,
      ticketNumbers: ticket.ticketNumbers,
    }));

    res.status(200).json(formattedTickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}
