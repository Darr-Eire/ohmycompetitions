import { dbConnect } from '../../../../lib/dbConnect';
import Competition from '../../../../models/Competition';

export default async function handler(req, res) {
  try {
    await dbConnect();

    // 🔐 Optional: Add back authentication when ready
    // const session = await getServerSession(req, res, authOptions);
    // if (!session || session.user?.role !== 'admin') {
    //   return res.status(401).json({ message: 'Unauthorized' });
    // }

    // 👉 Fetch all competitions
    if (req.method === 'GET') {
      const competitions = await Competition.find({}).sort({ createdAt: -1 }).lean();
      return res.status(200).json(competitions);
    }

    // ✅ Create a new competition
    if (req.method === 'POST') {
      const {
        slug,
        entryFee,
        totalTickets,
        title,
        prize,
        prizes = [],
        theme,
        startsAt,
        endsAt,
        piAmount,
        description,
        imageUrl,
        thumbnail,
        numberOfWinners
      } = req.body;

      console.log('📥 Received competition data:', req.body);

      // ⚠️ Validate required fields
      if (!slug || !title || (!prize && prizes.length === 0)) {
        return res.status(400).json({
          message: 'Missing required fields: slug, title, and at least one prize are required.'
        });
      }

      // ❌ Check for duplicate slug
      const existingCompetition = await Competition.findOne({ 'comp.slug': slug });
      if (existingCompetition) {
        return res.status(409).json({
          message: `Competition with slug "${slug}" already exists. Please use a different slug.`
        });
      }

      // 🆕 Create competition document
      const competition = await Competition.create({
        comp: {
          slug,
          entryFee: parseFloat(entryFee) || 0,
          totalTickets: parseInt(totalTickets) || 100,
          ticketsSold: 0,
          startsAt: startsAt ? new Date(startsAt) : new Date(),
          endsAt: endsAt ? new Date(endsAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
          paymentType: parseFloat(entryFee) > 0 ? 'pi' : 'free',
          piAmount: parseFloat(piAmount) || parseFloat(entryFee) || 0,
          status: 'active'
        },
        title,
        prize: prize || (prizes.length > 0 ? prizes[0] : ''),
        prizes: prizes.slice(0, 10), // ✅ Up to 10 prizes
        numberOfWinners: parseInt(numberOfWinners) || 1,
        description: description || '',
        href: `/competitions/${slug}`,
        theme: theme || 'tech',
        imageUrl: imageUrl || '/images/your.png',
        thumbnail: thumbnail?.trim() || null
      });

      console.log('✅ Competition created:', competition);
      return res.status(201).json(competition);
    }

    // 🗑️ Delete a competition
    if (req.method === 'DELETE') {
      const { id } = req.body;
      await Competition.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Competition deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('❌ Admin competitions API error:', error);

    if (error.code === 11000) {
      const duplicateField = error.keyValue;
      return res.status(409).json({
        message: `Duplicate entry for ${Object.keys(duplicateField)[0]}`,
        field: Object.keys(duplicateField)[0],
        value: Object.values(duplicateField)[0]
      });
    }

    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
}
