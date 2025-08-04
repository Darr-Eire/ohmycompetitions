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
        'comp.location': 1,
        'comp.prizeBreakdown': 1, // <-- Added this line
        title: 1,
        prize: 1,
        imageUrl: 1,
        theme: 1,
        href: 1,
        description: 1
      })
      .lean();

    if (!competition) {
      console.log('❌ Competition not found:', { slug });
      return res.status(404).json({ 
        error: 'Competition not found',
        code: 'COMPETITION_NOT_FOUND'
      });
    }

    // Flatten the structure to match what the frontend expects
    const response = {
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
      prizeBreakdown: competition.comp?.prizeBreakdown || {},  // <-- Added this line
    };

    console.log('✅ Competition found and formatted:', {
      slug,
      title: response.title,
      entryFee: response.entryFee,
      ticketsSold: response.ticketsSold,
      totalTickets: response.totalTickets,
      status: response.status
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error fetching competition:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}
