import { connectToDatabase } from '@/lib/mongodb';

// Shape we’ll return to the UI
// stages: [{stage:1..5, slug, title, pricePi, startsAt, endsAt, totalTickets, ticketsSold, winners, imageUrl }]
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { db } = await connectToDatabase();

    // Example: competitions are stored with a `comp.stage` field (1..5) and nested fields under `comp`
    // Adjust collection and field names to your schema.
    const docs = await db.collection('competitions')
      .find({ 'comp.type': 'funnel', 'comp.stage': { $in: [1,2,3,4,5] } })
      .project({
        _id: 0,
        stage: '$comp.stage',
        slug: '$comp.slug',
        title: '$comp.title',
        pricePi: '$comp.entryFee',            // rename if needed
        startsAt: '$comp.startsAt',
        endsAt: '$comp.endsAt',
        totalTickets: '$comp.totalTickets',
        ticketsSold: '$comp.ticketsSold',
        winners: '$comp.winnersCount',
        imageUrl: '$comp.imageUrl'
      })
      .toArray();

    // Ensure we always return 5 slots in order
    const byStage = new Map(docs.map(d => [Number(d.stage), d]));
    const stages = [1,2,3,4,5].map(s => byStage.get(s) || {
      stage: s,
      slug: null,
      title: `Stage ${s}`,
      pricePi: null,
      startsAt: null,
      endsAt: null,
      totalTickets: null,
      ticketsSold: null,
      winners: null,
      imageUrl: '/pi.jpeg'
    });

    // You can compute a live prize pool if you prefer; for now return a fixed or DB-backed value
    const prizePoolPi = 2250;

    res.status(200).json({ success: true, stages, prizePoolPi });
  } catch (e) {
    console.error('funnel stages api error', e);
    res.status(500).json({ success: false, error: 'Failed to load stages' });
  }
}
