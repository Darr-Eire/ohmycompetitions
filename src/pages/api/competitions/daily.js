// /pages/api/competitions/daily.js

import { dbConnect } from 'lib/dbConnect';
import Competition from 'models/Competition';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const now = new Date();

    const competitions = await Competition.find({
      theme: 'daily',
      'comp.status': 'active',
      'comp.startsAt': { $lte: now },
    })
      .select({
        _id: 1,
        title: 1,
        prize: 1,
        imageUrl: 1,
        theme: 1,
        href: 1,
        description: 1,
        'comp.slug': 1,
        'comp.status': 1,
        'comp.ticketsSold': 1,
        'comp.totalTickets': 1,
        'comp.entryFee': 1,
        'comp.piAmount': 1,
        'comp.paymentType': 1,
        'comp.startsAt': 1,
        'comp.endsAt': 1,
        'comp.location': 1,
        'comp.maxTicketsPerUser': 1,
      })
      .lean();

    const formatted = competitions.map((competition) => ({
      _id: competition._id,
      slug: competition.comp?.slug,
      title: competition.title,
      prize: competition.prize,
      description: competition.description,
      imageUrl: competition.imageUrl || '/images/default-prize.png',
      theme: competition.theme,
      href: competition.href,
      ticketsSold: competition.comp?.ticketsSold || 0,
      totalTickets: competition.comp?.totalTickets || 100,
      entryFee: competition.comp?.entryFee || 0,
      piAmount: competition.comp?.piAmount || competition.comp?.entryFee || 0,
      status: competition.comp?.status || 'active',
      paymentType: competition.comp?.paymentType || 'pi',
      startsAt: competition.comp?.startsAt,
      endsAt: competition.comp?.endsAt,
      location: competition.comp?.location || 'Online',
      maxTicketsPerUser: competition.comp?.maxTicketsPerUser || 10,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('❌ Error fetching daily competitions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch competitions' });
  }
}
