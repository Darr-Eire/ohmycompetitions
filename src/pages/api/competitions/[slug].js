import { dbConnect } from 'lib/dbConnect';
import Competition from 'models/Competition';

export default async function handler(req, res) {
  // Set CORS headers to prevent ad blocker issues
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Missing slug parameter' });
  }

  try {
    await dbConnect();

    // Get competition by slug using Mongoose
    const competition = await Competition.findOne({ 'comp.slug': slug })
      .select({
        _id: 1,
        'comp.status': 1,
        'comp.ticketsSold': 1,
        'comp.totalTickets': 1,
        'comp.entryFee': 1,
        'comp.startsAt': 1,
        'comp.endsAt': 1,
        'comp.slug': 1,
        'comp.paymentType': 1,
        'comp.piAmount': 1,
        title: 1,
        prize: 1,
        imageUrl: 1,
        theme: 1,
        href: 1
      })
      .lean();

    if (!competition) {
      console.log('❌ Competition not found:', { slug });
      return res.status(404).json({ 
        success: false,
        error: 'Competition not found',
        code: 'COMPETITION_NOT_FOUND'
      });
    }

    // Format the response with default values
    const response = {
      success: true,
      data: {
        ...competition,
        comp: {
          ...competition.comp,
          ticketsSold: competition.comp?.ticketsSold || 0,
          totalTickets: competition.comp?.totalTickets || 100,
          entryFee: competition.comp?.entryFee || 0,
          status: competition.comp?.status || 'active',
          paymentType: competition.comp?.paymentType || 'pi'
        },
        imageUrl: competition.imageUrl || '/images/default-prize.png'
      }
    };

    console.log('✅ Competition found:', {
      slug,
      title: competition.title,
      entryFee: competition.comp?.entryFee,
      ticketsSold: competition.comp?.ticketsSold,
      totalTickets: competition.comp?.totalTickets
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error fetching competition:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
} 