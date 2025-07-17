import { dbConnect } from '../../../../lib/dbConnect';
import Competition from '../../../../models/Competition';

export default async function handler(req, res) {
  try {
    await dbConnect();
    
    // Skip auth for testing - can be re-enabled later
    // const session = await getServerSession(req, res, authOptions);
    // if (!session || session.user?.role !== 'admin') {
    //   return res.status(401).json({ message: 'Unauthorized' });
    // }

    if (req.method === 'GET') {
      const competitions = await Competition.find({}).sort({ createdAt: -1 }).lean();
      return res.status(200).json(competitions);
    }

    if (req.method === 'POST') {
      const { slug, entryFee, totalTickets, title, prize, theme, startsAt, endsAt, piAmount, description, imageUrl, thumbnail } = req.body;
      
      console.log('Received competition data:', req.body);
      
      // Validate required fields
      if (!slug || !title || !prize) {
        return res.status(400).json({ 
          message: 'Missing required fields: slug, title, and prize are required.' 
        });
      }
      
      // Check if competition with this slug already exists
      const existingCompetition = await Competition.findOne({ 'comp.slug': slug });
      if (existingCompetition) {
        return res.status(409).json({ 
          message: `Competition with slug "${slug}" already exists. Please use a different slug.` 
        });
      }
      
      const competition = await Competition.create({
        comp: { 
          slug, 
          entryFee: parseFloat(entryFee) || 0, 
          totalTickets: parseInt(totalTickets) || 100, 
          ticketsSold: 0,
         startsAt: startsAt ? new Date(startsAt) : new Date(),
endsAt: endsAt ? new Date(endsAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

          paymentType: entryFee > 0 ? 'pi' : 'free',
          piAmount: parseFloat(piAmount) || parseFloat(entryFee) || 0,
          status: 'active'
        },
        title,
        prize,
        description: description || '',
        href: `/competitions/${slug}`,
        theme: theme || 'tech',
        imageUrl: imageUrl || '/images/your.png',
        thumbnail: thumbnail && thumbnail.trim() !== '' ? thumbnail : null
      });
      
      console.log('Competition created:', competition);
      return res.status(201).json(competition);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      await Competition.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Competition deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end();
  } catch (error) {
    console.error('Admin competitions API error:', error);
    
    // Handle duplicate key errors specifically
    if (error.code === 11000) {
      const duplicateField = error.keyValue;
      return res.status(409).json({ 
        message: `Competition with this ${Object.keys(duplicateField)[0]} already exists. Please use a different value.`,
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
