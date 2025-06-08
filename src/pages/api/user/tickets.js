import dbConnect from 'lib/dbConnect'; // your db connection helper
import Ticket from 'models/Ticket'; // your mongoose model for tickets
import { getSession } from 'next-auth/react'; // if you're using NextAuth

export default async function handler(req, res) {
  await dbConnect();

  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = session.user.id;

  try {
    const tickets = await Ticket.find({ userId });

    const formattedTickets = tickets.map(ticket => ({
      competitionTitle: ticket.competitionTitle,
      quantity: ticket.quantity,
      purchasedAt: ticket.purchasedAt,
      ticketNumbers: ticket.ticketNumbers,
    }));

    res.status(200).json(formattedTickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}
