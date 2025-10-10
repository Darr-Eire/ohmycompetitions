import { connectToDatabase } from '../../../../lib/mongodb';
import initCORS from '../../../../lib/cors';

export default async function handler(req, res) {
  try {
    // Handle CORS
    const shouldEndRequest = await initCORS(req, res);
    if (shouldEndRequest) {
      return;
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing slug parameter',
        code: 'MISSING_SLUG'
      });
    }

    // Connect to database
    const { db } = await connectToDatabase().catch(error => {
      console.error('❌ Database connection error:', error);
      throw new Error('Database connection failed');
    });

    if (!db) {
      throw new Error('Database connection failed');
    }

    // Get competition by slug using the correct nested structure
    const competition = await db.collection('competitions').findOne(
      { 'comp.slug': slug },
      {
        projection: {
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
          location: 1,
          theme: 1
        }
      }
    );

    if (!competition) {
      console.log('❌ Game not found:', { slug });
      return res.status(404).json({ 
        success: false,
        error: 'Game not found',
        code: 'GAME_NOT_FOUND'
      });
    }

    // Format the response with default values, handling the nested structure
    const response = {
      success: true,
      data: {
        id: competition._id,
        status: competition.comp?.status || 'active',
        ticketsSold: competition.comp?.ticketsSold || 0,
        totalTickets: competition.comp?.totalTickets || 100,
        entryFee: competition.comp?.entryFee || 0,
        startsAt: competition.comp?.startsAt,
        endsAt: competition.comp?.endsAt,
        slug: competition.comp?.slug,
        paymentType: competition.comp?.paymentType || 'pi',
        piAmount: competition.comp?.piAmount,
        title: competition.title,
        prize: competition.prize,
        imageUrl: competition.imageUrl,
        location: competition.location || 'Online',
        theme: competition.theme
      }
    };

    console.log('✅ Game details found:', {
      slug,
      title: competition.title,
      entryFee: competition.comp?.entryFee,
      ticketsSold: competition.comp?.ticketsSold,
      totalTickets: competition.comp?.totalTickets,
      paymentType: competition.comp?.paymentType
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error fetching game details:', {
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