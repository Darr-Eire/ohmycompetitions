// src/pages/api/admin/competitions.js

import { connectToDatabase } from '../../../lib/dbConnect.js';
import Competition from '../../../models/Competition.js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth.js';

export default async function handler(req, res) {
  await connectToDatabase();

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const {
      slug, title, prize, entryFee,
      totalTickets, startsAt, endsAt, location, theme
    } = req.body;

    if (!slug || !title || !prize || entryFee == null || !totalTickets || !theme) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const existing = await Competition.findOne({ slug });
      if (existing) {
        return res.status(409).json({ message: 'Competition already exists' });
      }

      const competition = await Competition.create({
        comp: {
          slug,
          entryFee,
          totalTickets,
          ticketsSold: 0,
          startsAt: startsAt || null,
          endsAt: endsAt || null,
          location: location || ''
        },
        title,
        prize,
        href: `/competitions/${slug}`,
        theme
      });

      res.status(201).json(competition);
    } catch (err) {
      console.error('POST /admin/competitions error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  if (req.method === 'GET') {
    try {
      const competitions = await Competition.find({}).lean();
      res.status(200).json(competitions || []);
    } catch (err) {
      console.error('GET /admin/competitions error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
