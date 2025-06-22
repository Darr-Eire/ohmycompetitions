import { connectToDatabase } from '../../../lib/mongodb';
import initCORS from '../../../lib/cors';

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

    // Connect to database
    const { db } = await connectToDatabase().catch(error => {
      console.error('❌ Database connection error:', error);
      throw new Error('Database connection failed');
    });

    if (!db) {
      throw new Error('Database connection failed');
    }

    // Get all competitions
    const competitions = await db.collection('competitions').find(
      {},
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
          'comp.comingSoon': 1,
          title: 1,
          prize: 1,
          imageUrl: 1,
          location: 1,
          theme: 1,
          href: 1
        }
      }
    ).toArray();

    // Format the response
    const formattedCompetitions = competitions.map(competition => ({
      comp: {
        ...competition.comp,
        ticketsSold: competition.comp?.ticketsSold || 0,
        totalTickets: competition.comp?.totalTickets || 100,
        entryFee: competition.comp?.entryFee || 0,
        status: competition.comp?.status || 'active',
        paymentType: competition.comp?.paymentType || 'pi'
      },
      title: competition.title,
      prize: competition.prize,
      imageUrl: competition.imageUrl,
      location: competition.location || 'Online',
      theme: competition.theme,
      href: competition.href,
      fee: `${competition.comp?.entryFee || 0} π`
    }));

    console.log(`✅ Found ${formattedCompetitions.length} competitions`);

    res.status(200).json({
      success: true,
      data: formattedCompetitions
    });
  } catch (error) {
    console.error('❌ Error fetching competitions:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
} 