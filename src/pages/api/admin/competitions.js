import { connectToDatabase } from 'lib/dbConnect';
import Competition from 'models/Competition';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';

export default async function handler(req, res) {
  await connectToDatabase();

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user?.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const competitions = await Competition.find({});
      res.status(200).json(competitions);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  if (req.method === 'POST') {
    const { slug, title, prize, entryFee, totalTickets, startsAt, endsAt, location, theme } = req.body;

    if (!slug || !title || !prize || entryFee == null || !totalTickets || !theme) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const existing = await Competition.findOne({ slug });
      if (existing) {
        return res.status(409).json({ message: 'Competition already exists' });
      }

      const competition = await Competition.create({
        comp: { slug, entryFee, totalTickets, ticketsSold: 0, startsAt, endsAt, location },
        title, prize, href: `/competitions/${slug}`, theme
      });

      res.status(201).json(competition);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
}
