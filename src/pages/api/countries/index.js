import { dbConnect } from 'lib/dbConnect';
import Country from 'models/Country';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      // Fetch all active countries
      const countries = await Country.find({ isActive: true })
        .sort({ 
          piNetworkPopular: -1, // Pi Network popular countries first
          sortOrder: 1,         // Custom sort order
          name: 1               // Alphabetical
        })
        .select('code name region piNetworkPopular flagUrl')
        .lean();

      // Format for frontend compatibility
      const formattedCountries = countries.map(country => ({
        code: country.code,
        name: country.name,
        region: country.region,
        popular: country.piNetworkPopular,
        flagUrl: country.flagUrl
      }));

      res.status(200).json({
        success: true,
        data: formattedCountries
      });
    } catch (error) {
      console.error('Error fetching countries:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch countries'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 