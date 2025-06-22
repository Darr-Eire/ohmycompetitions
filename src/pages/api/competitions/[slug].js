import { connectToDatabase } from '../../../lib/mongodb';

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
    // Get database connection
    const { db } = await connectToDatabase();

    // Get competition by slug
    const competition = await db.collection('competitions').findOne(
      { slug },
      {
        projection: {
          _id: 1,
          status: 1,
          ticketsSold: 1,
          totalTickets: 1,
          entryFee: 1,
          startsAt: 1,
          endsAt: 1,
          slug: 1,
          title: 1,
          prize: 1,
          imageUrl: 1,
          location: 1
        }
      }
    );

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
        ticketsSold: competition.ticketsSold || 0,
        totalTickets: competition.totalTickets || 100,
        entryFee: competition.entryFee || 0,
        location: competition.location || 'Online',
        status: competition.status || 'active'
      }
    };

    console.log('✅ Competition found:', {
      slug,
      title: competition.title,
      entryFee: competition.entryFee,
      ticketsSold: competition.ticketsSold,
      totalTickets: competition.totalTickets
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error fetching competition:', {
      error: error.message,
      stack: error.stack,
      slug
    });
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
} 