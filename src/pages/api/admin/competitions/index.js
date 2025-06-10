import { connectToDatabase } from 'lib/dbConnect';import Competition from 'models/Competition';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';

export default async function handler(req, res) {
  await dbConnect();
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user?.role !== 'admin') return res.status(401).json({ message: 'Unauthorized' });

  if (req.method === 'GET') {
    const competitions = await Competition.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json(competitions);
  }

  if (req.method === 'POST') {
    const { slug, entryFee, totalTickets, title, prize, theme } = req.body;
    const competition = await Competition.create({
      comp: { slug, entryFee, totalTickets, ticketsSold: 0 },
      title,
      prize,
      href: `/competitions/${slug}`,
      theme
    });
    return res.status(201).json(competition);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end();
}
