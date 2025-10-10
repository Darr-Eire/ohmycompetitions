// pages/api/admin/competitions/[id]/winners.js
import { dbConnect } from '../../../../../lib/dbConnect';
import Competition from '../../../../../models/Competition';
import mongoose from 'mongoose';
import { requireAdmin } from '../../_adminAuth';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  
  // Check admin authentication
  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    await dbConnect();

    const { id } = req.query;

    // Validate ID
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(id);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid competition ID' });
    }

    // Get competition with winners
    const competition = await Competition.findById(objectId)
      .populate('winners.userId', 'username email uid')
      .lean();

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    // Format winners data
    const winners = (competition.winners || []).map((winner, index) => ({
      position: index + 1,
      userId: winner.userId?._id || winner.userId,
      username: winner.username || winner.userId?.username || 'Unknown',
      email: winner.userId?.email || 'N/A',
      ticketNumber: winner.ticketNumber,
      claimed: winner.claimed || false,
      claimedAt: winner.claimedAt,
      prize: competition.prizeBreakdown?.[index] || competition.prize
    }));

    res.status(200).json({
      success: true,
      competition: {
        id: competition._id,
        title: competition.title,
        slug: competition.comp?.slug || competition.slug,
        status: competition.comp?.status || 'unknown',
        totalWinners: competition.comp?.winnersCount || 0,
        actualWinners: winners.length
      },
      winners
    });

  } catch (error) {
    console.error('Error fetching competition winners:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}







