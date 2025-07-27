import { dbConnect } from '../../../lib/dbConnect';
import Competition from '../../../models/Competition';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Define competitions using admin dashboard format for consistency
    const competitionsToSeed = [
      // Tech Competitions
      {
        slug: 'ps5-bundle-giveaway',
        title: 'PS5 Bundle Giveaway',
        prize: 'PlayStation 5 + Controller',
        description: 'Win the latest PlayStation 5 console with an extra controller. Perfect for gaming enthusiasts!',
        totalTickets: 1100,
        entryFee: 0.40,
        piAmount: 0.40,
        theme: 'tech',
        startsAt: '2025-07-01T14:00:00Z',
        endsAt: '2025-08-01T14:00:00Z',
        status: 'active'
      },
      {
        slug: '55-inch-tv-giveaway',
        title: '55″ Smart TV Giveaway',
        prize: '55″ 4K Smart TV',
        description: 'Experience entertainment like never before with this stunning 55-inch 4K Smart TV.',
        totalTickets: 1500,
        entryFee: 0.45,
        piAmount: 0.45,
        theme: 'tech',
        startsAt: '2025-07-09T11:30:00Z',
        endsAt: '2025-07-16T11:30:00Z',
        status: 'active'
      },
      {
        slug: 'xbox-one-bundle',
        title: 'Xbox One Bundle',
        prize: 'Xbox One + Game Pass',
        description: 'Get the ultimate gaming experience with Xbox One console and Game Pass subscription.',
        totalTickets: 1300,
        entryFee: 0.35,
        piAmount: 0.35,
        theme: 'tech',
        startsAt: '2025-07-05T17:45:00Z',
        endsAt: '2025-07-12T17:45:00Z',
        status: 'active'
      },
      {
        slug: 'nintendo-switch',
        title: 'Nintendo Switch Console',
        prize: 'Nintendo Switch',
        description: 'Play your favorite games anywhere with the versatile Nintendo Switch console.',
        totalTickets: 1830,
        entryFee: 0.36,
        piAmount: 0.36,
        theme: 'tech',
        startsAt: '2025-07-02T13:30:00Z',
        endsAt: '2025-07-09T13:30:00Z',
        status: 'active'
      },
      {
        slug: 'apple-airpods-pro',
        title: 'Apple AirPods Pro',
        prize: 'Apple AirPods Pro (Latest Generation)',
        description: 'Experience premium sound quality and noise cancellation with Apple AirPods Pro.',
        totalTickets: 800,
        entryFee: 0.25,
        piAmount: 0.25,
        theme: 'tech',
        startsAt: '2025-07-01T12:00:00Z',
        endsAt: '2025-07-15T12:00:00Z',
        status: 'active'
      },
      {
        slug: 'ray-ban-meta-glasses',
        title: 'Ray-Ban Meta Smart Glasses',
        prize: 'Ray-Ban Meta Wayfarer Smart Glasses',
        description: 'The future of eyewear - capture, share and listen with these innovative smart glasses.',
        totalTickets: 2000,
        entryFee: 0.60,
        piAmount: 0.60,
        theme: 'tech',
        startsAt: '2025-07-05T13:30:00Z',
        endsAt: '2025-07-12T13:30:00Z',
        status: 'active'
      },

      // Premium/Travel Competitions
      {
        slug: 'dubai-luxury-vacation',
        title: 'Dubai Luxury Vacation',
        prize: '7-Day All-Inclusive Dubai Trip',
        description: 'Experience the luxury of Dubai with a 7-day all-inclusive vacation package for two people.',
        totalTickets: 4000,
        entryFee: 2.5,
        piAmount: 2.5,
        theme: 'premium',
        startsAt: '2025-06-15T22:00:00Z',
        endsAt: '2025-08-15T22:00:00Z',
        status: 'active'
      },
      {
        slug: 'penthouse-weekend-stay',
        title: 'Luxury Penthouse Weekend',
        prize: '3-Night Penthouse Stay',
        description: 'Enjoy a luxurious 3-night stay in a premium penthouse with breathtaking city views.',
        totalTickets: 3000,
        entryFee: 1.5,
        piAmount: 1.5,
        theme: 'premium',
        startsAt: '2025-07-01T18:00:00Z',
        endsAt: '2025-08-01T18:00:00Z',
        status: 'active'
      },

      // Pi Competitions
      {
        slug: 'weekly-pi-reward',
        title: 'Weekly Pi Rewards',
        prize: '100 π Tokens',
        description: 'Win 100 Pi tokens in our weekly giveaway. Easy entry, big rewards!',
        totalTickets: 2000,
        entryFee: 0.10,
        piAmount: 0.10,
        theme: 'pi',
        startsAt: '2025-07-01T00:00:00Z',
        endsAt: '2025-07-08T00:00:00Z',
        status: 'active'
      },

      // Daily Competitions
      {
        slug: 'daily-pi-jackpot',
        title: 'Daily Pi Jackpot',
        prize: '25 π Daily Reward',
        description: 'Quick daily competition with instant Pi rewards. New winner every day!',
        totalTickets: 500,
        entryFee: 0.05,
        piAmount: 0.05,
        theme: 'daily',
        startsAt: '2025-07-07T00:00:00Z',
        endsAt: '2025-07-08T00:00:00Z',
        status: 'active'
      }
    ];

    // Check existing competitions
    const existingComps = await Competition.find({});
    const existingSlugs = new Set(existingComps.map(comp => comp.comp?.slug).filter(Boolean));
    
    console.log(`Found ${existingComps.length} existing competitions in database`);

    // Filter out competitions that already exist
    const newCompetitions = competitionsToSeed.filter(comp => !existingSlugs.has(comp.slug));
    
    console.log(`${newCompetitions.length} new competitions to add`);

    // Insert new competitions using the same structure as admin dashboard
    const results = [];
    for (const compData of newCompetitions) {
      try {
        // Create competition using the same structure as admin dashboard API
        const competitionDoc = {
          comp: { 
            slug: compData.slug,
            entryFee: parseFloat(compData.entryFee) || 0,
            totalTickets: parseInt(compData.totalTickets) || 100,
            ticketsSold: 0,
            startsAt: compData.startsAt || new Date().toISOString(),
            endsAt: compData.endsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            paymentType: compData.entryFee > 0 ? 'pi' : 'free',
            piAmount: parseFloat(compData.piAmount) || parseFloat(compData.entryFee) || 0,
            status: compData.status || 'active',
            prizePool: 0
          },
          title: compData.title,
          prize: compData.prize,
          description: compData.description || '',
          href: `/competitions/${compData.slug}`,
          theme: compData.theme || 'tech',
          imageUrl: getImageUrl(compData.theme, compData.slug),
          winners: [],
          payments: []
        };

        const newComp = await Competition.create(competitionDoc);
        results.push({
          status: 'success',
          title: compData.title,
          slug: compData.slug,
          id: newComp._id
        });
        console.log(`✅ Added: ${compData.title} (${compData.slug})`);
      } catch (err) {
        results.push({
          status: 'error',
          title: compData.title,
          slug: compData.slug,
          error: err.message
        });
        console.log(`❌ Failed to add: ${compData.title} - ${err.message}`);
      }
    }

    // Get final count
    const finalCount = await Competition.countDocuments();

    res.status(200).json({
      success: true,
      message: 'Competition seeding completed',
      data: {
        existingCount: existingComps.length,
        newlyAdded: results.filter(r => r.status === 'success').length,
        errors: results.filter(r => r.status === 'error').length,
        totalAfter: finalCount,
        results: results
      }
    });

  } catch (error) {
    console.error('❌ Seeding error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Helper function to get appropriate image URLs
function getImageUrl(theme, slug) {
  const imageMap = {
    'ps5-bundle-giveaway': '/images/playstation.jpeg',
    '55-inch-tv-giveaway': '/images/tv.jpg',
    'xbox-one-bundle': '/images/xbox.jpeg',
    'nintendo-switch': '/images/nintendo.png',
    'apple-airpods-pro': '/images/airpods.png',
    'ray-ban-meta-glasses': '/images/glasses.jpg',
    'dubai-luxury-vacation': '/images/dubai-luxury-holiday.jpg',
    'penthouse-weekend-stay': '/images/hotel.jpeg',
    'weekly-pi-reward': '/images/bitcoin.png',
    'daily-pi-jackpot': '/images/daily.png'
  };

  return imageMap[slug] || '/images/default-prize.png';
} 