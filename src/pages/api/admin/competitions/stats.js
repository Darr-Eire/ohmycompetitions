// pages/api/admin/competitions/stats.js
import { dbConnect } from '../../../../lib/dbConnect';
import Competition from '../../../../models/Competition';
import Entry from '../../../../models/Entry';
import Payment from '../../../../models/Payment';
import { requireAdmin } from '../_adminAuth';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  
  // Check admin authentication
  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    await dbConnect();

    const { competitionId } = req.query;

    // Build filter for specific competition or all
    const competitionFilter = competitionId ? { _id: competitionId } : {};

    // Get competition stats
    const competitions = await Competition.find(competitionFilter).lean();
    
    const stats = {
      totalCompetitions: competitions.length,
      activeCompetitions: competitions.filter(c => c.comp?.status === 'active').length,
      completedCompetitions: competitions.filter(c => c.comp?.status === 'completed').length,
      totalTicketsSold: competitions.reduce((sum, c) => sum + (c.comp?.ticketsSold || 0), 0),
      totalPrizePool: competitions.reduce((sum, c) => sum + (c.comp?.prizePool || 0), 0),
      totalWinners: competitions.reduce((sum, c) => sum + (c.winners?.length || 0), 0),
      totalPayments: 0,
      totalRevenue: 0,
      averageTicketsPerCompetition: 0,
      competitions: []
    };

    // Get detailed stats for each competition
    for (const comp of competitions) {
      const competitionSlug = comp.comp?.slug || comp.slug;
      
      // Get entries for this competition
      const entries = await Entry.find({ competitionSlug }).lean();
      
      // Get payments for this competition
      const payments = await Payment.find({ 
        competitionSlug,
        status: 'completed' 
      }).lean();

      const competitionStats = {
        id: comp._id,
        title: comp.title,
        slug: competitionSlug,
        status: comp.comp?.status || 'unknown',
        ticketsSold: comp.comp?.ticketsSold || 0,
        totalTickets: comp.comp?.totalTickets || 0,
        prizePool: comp.comp?.prizePool || 0,
        entryFee: comp.comp?.entryFee || 0,
        winnersCount: comp.winners?.length || 0,
        entriesCount: entries.length,
        paymentsCount: payments.length,
        revenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
        createdAt: comp.createdAt,
        updatedAt: comp.updatedAt
      };

      stats.competitions.push(competitionStats);
      stats.totalPayments += competitionStats.paymentsCount;
      stats.totalRevenue += competitionStats.revenue;
    }

    // Calculate averages
    if (stats.totalCompetitions > 0) {
      stats.averageTicketsPerCompetition = Math.round(stats.totalTicketsSold / stats.totalCompetitions);
    }

    res.status(200).json(stats);

  } catch (error) {
    console.error('Error fetching competition stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

