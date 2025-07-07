import { dbConnect } from '../../lib/dbConnect';
import Competition from '../../models/Competition';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Get all competitions from database
    const competitions = await Competition.find({}).lean();

    // Format for easy reading
    const formattedComps = competitions.map(comp => ({
      id: comp._id,
      slug: comp.comp?.slug,
      title: comp.title,
      theme: comp.theme,
      status: comp.comp?.status,
      ticketsSold: comp.comp?.ticketsSold || 0,
      totalTickets: comp.comp?.totalTickets,
      entryFee: comp.comp?.entryFee,
      imageUrl: comp.imageUrl,
      hasComp: !!comp.comp,
      createdAt: comp.createdAt
    }));

    res.status(200).json({
      success: true,
      count: competitions.length,
      competitions: formattedComps,
      raw: competitions
    });

  } catch (error) {
    console.error('Debug API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
} 