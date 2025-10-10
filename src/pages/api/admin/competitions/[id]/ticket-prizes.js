// src/pages/api/admin/competitions/[id]/ticket-prizes.js
import { dbConnect } from 'lib/dbConnect';
import Competition from 'models/Competition';
import mongoose from 'mongoose';
import { requireAdmin } from '../../_adminAuth';

export default async function handler(req, res) {
  // Protect all methods (GET/POST/DELETE) behind admin
  const admin = requireAdmin(req, res);
  if (!admin) return;

  if (!['GET', 'POST', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { id } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid competition ID' });
    }

    if (req.method === 'GET') {
      const competition = await Competition.findById(id).select('ticketPrizes title comp.slug');
      if (!competition) return res.status(404).json({ message: 'Competition not found' });

      return res.status(200).json({
        success: true,
        ticketPrizes: competition.ticketPrizes || [],
        competition: {
          id: competition._id,
          title: competition.title,
          slug: competition.comp?.slug,
        },
      });
    }

    if (req.method === 'POST') {
      const { ticketPrizes } = req.body || {};
      if (!Array.isArray(ticketPrizes)) {
        return res.status(400).json({ message: 'ticketPrizes must be an array' });
      }

      // Normalize + validate
      const cleaned = ticketPrizes
        .map((p) => ({
          competitionSlug: String(p?.competitionSlug || '').trim(),
          ticketCount: Math.max(1, Number(p?.ticketCount) || 1),
          position:
            p?.position === null || p?.position === '' || p?.position === undefined
              ? null
              : Math.max(1, Number(p.position) || 1),
        }))
        .filter((p) => p.competitionSlug.length > 0);

      if (cleaned.length === 0) {
        return res.status(400).json({ message: 'Provide at least one valid ticket prize' });
      }

      const competition = await Competition.findByIdAndUpdate(
        id,
        { $set: { ticketPrizes: cleaned } },
        { new: true }
      );
      if (!competition) return res.status(404).json({ message: 'Competition not found' });

      return res.status(200).json({
        success: true,
        message: 'Ticket prizes updated successfully',
        ticketPrizes: competition.ticketPrizes || [],
        competition: {
          id: competition._id,
          title: competition.title,
          slug: competition.comp?.slug,
        },
      });
    }

    // DELETE
    const competition = await Competition.findByIdAndUpdate(
      id,
      { $unset: { ticketPrizes: 1 } },
      { new: true }
    );
    if (!competition) return res.status(404).json({ message: 'Competition not found' });

    return res.status(200).json({
      success: true,
      message: 'Ticket prizes removed successfully',
      competition: {
        id: competition._id,
        title: competition.title,
        slug: competition.comp?.slug,
      },
    });
  } catch (error) {
    console.error('ticket-prizes error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
