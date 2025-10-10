import { dbConnect } from 'lib/dbConnect';
import Competition from 'models/Competition';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Get all competitions using Mongoose
    const competitions = await Competition.find({})
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
        'comp.prizeBreakdown': 1,  // Include prizeBreakdown from comp
        title: 1,
        prize: 1,
        imageUrl: 1,
        thumbnail: 1,
        theme: 1,
        href: 1
      })
      .lean();

    // Format the response
    const formattedCompetitions = competitions.map(competition => ({
      _id: competition._id,
      comp: {
        ...competition.comp,
        ticketsSold: competition.comp?.ticketsSold || 0,
        totalTickets: competition.comp?.totalTickets || 100,
        entryFee: competition.comp?.entryFee || 0,
        status: competition.comp?.status || 'active',
        paymentType: competition.comp?.paymentType || 'pi',
        prizeBreakdown: competition.comp?.prizeBreakdown || null,
      },
      title: competition.title,
      prize: competition.prize,
      imageUrl: competition.imageUrl || '/images/your.png',
      thumbnail: competition.thumbnail || null,
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
    console.error('❌ Error fetching competitions:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}
