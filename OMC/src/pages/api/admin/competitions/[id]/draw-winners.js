// src/pages/api/admin/competitions/[id]/draw-winners.js

import { dbConnect } from '../../../../../lib/dbConnect';
import Competition from '../../../../../models/Competition';
import TicketCredit from '../../../../../models/TicketCredit';
import mongoose from 'mongoose';
import { requireAdmin } from '../../_adminAuth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Admin authentication
  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    await dbConnect();

    const { id } = req.query;

    // ✅ Validate ID safely
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(id);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid competition ID' });
    }

    // ✅ Fetch competition
    const competition = await Competition.findById(objectId);
    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    if (competition.comp?.status !== 'active') {
      return res.status(400).json({ message: 'Competition is not active' });
    }

    const now = new Date();
    const endTime = new Date(competition.comp?.endsAt);
    if (now < endTime) {
      return res.status(400).json({ message: 'Competition has not ended yet' });
    }

    if (competition.winners?.length > 0) {
      return res.status(400).json({ message: 'Winners already drawn for this competition' });
    }

    // ✅ Get completed payments
    const payments = await mongoose.connection.db
      .collection('payments')
      .find({ competitionSlug: competition.comp.slug, status: 'completed' })
      .toArray();

    if (!payments.length) {
      return res.status(400).json({ message: 'No completed payments found' });
    }

    // ✅ Build ticket pool
    const ticketPool = [];
    payments.forEach((payment) => {
      const qty = payment.ticketQuantity || 1;
      const start = payment.ticketNumber || 1;
      for (let i = 0; i < qty; i++) {
        ticketPool.push({
          ticketNumber: start + i,
          userId: payment.piUser?.uid || payment.uid,
          username: payment.piUser?.username || payment.username,
          paymentId: payment.paymentId,
        });
      }
    });

    if (!ticketPool.length) {
      return res.status(400).json({ message: 'No tickets found for this competition' });
    }

    // ✅ Draw winners
    const winnersCount = competition.comp?.winnersCount || 1;
    const actualWinnersCount = Math.min(winnersCount, ticketPool.length);

    const shuffled = [...ticketPool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selectedWinners = shuffled.slice(0, actualWinnersCount).map((ticket, index) => ({
      userId: ticket.userId,
      username: ticket.username,
      ticketNumber: ticket.ticketNumber,
      position: index + 1,
      claimed: false,
      claimedAt: null,
    }));

    // ✅ Ticket prizes awarding
    const ticketPrizesAwarded = [];
    if (competition.ticketPrizes?.length > 0) {
      for (const prize of competition.ticketPrizes) {
        const eligible = prize.position
          ? selectedWinners.filter((w) => w.position === prize.position)
          : selectedWinners;

        for (const winner of eligible) {
          try {
            const credit = await TicketCredit.create({
              userId: winner.userId,
              username: winner.username,
              competitionSlug: prize.competitionSlug,
              qty: prize.ticketCount,
              source: 'prize',
              reason: `Won ${competition.title} - Position ${winner.position}`,
              meta: {
                wonFromCompetition: competition.comp.slug,
                position: winner.position,
                ticketNumber: winner.ticketNumber,
              },
            });

            ticketPrizesAwarded.push({
              winner: winner.username,
              position: winner.position,
              competitionSlug: prize.competitionSlug,
              ticketCount: prize.ticketCount,
              creditId: credit._id,
            });

            console.log(
              `🎫 Awarded ${prize.ticketCount} tickets for ${prize.competitionSlug} to ${winner.username} (position ${winner.position})`
            );
          } catch (err) {
            console.error(`❌ Failed to award prize to ${winner.username}:`, err);
          }
        }
      }
    }

    // ✅ Award XP and optional stage advancement
    for (const winner of selectedWinners) {
      try {
        const xpRes = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/user/xp/award`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: winner.userId,
              username: winner.username,
              amount: 100,
              reason: `Won ${competition.title} - Position ${winner.position}`,
              source: 'win',
            }),
          }
        );

        if (!xpRes.ok) {
          console.warn(`⚠️ XP failed for ${winner.username}:`, await xpRes.text());
        }

        const stagePrize = (competition.ticketPrizes || []).find(
          (p) =>
            (!p.position || p.position === winner.position) &&
            p.competitionSlug === 'stage-advance'
        );
        if (stagePrize) {
          await fetch(
            `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/stages/issue`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: winner.username,
                stage: 2,
                count: stagePrize.ticketCount || 1,
                source: 'win',
              }),
            }
          ).catch(() => {});
        }
      } catch (err) {
        console.warn(`⚠️ XP awarding failed for ${winner.username}:`, err.message);
      }
    }

    // ✅ Mark competition completed
    await Competition.findByIdAndUpdate(objectId, {
      $set: {
        winners: selectedWinners,
        'comp.status': 'completed',
        'comp.completedAt': new Date(),
      },
    });

    console.log(
      `🏆 ${actualWinnersCount} winners drawn for ${competition.title}:`,
      selectedWinners.map((w) => `${w.username} (#${w.ticketNumber})`).join(', ')
    );

    return res.status(200).json({
      success: true,
      message: `Successfully drew ${actualWinnersCount} winner(s).`,
      winners: selectedWinners,
      ticketPrizesAwarded,
      competition: {
        id: competition._id,
        title: competition.title,
        slug: competition.comp.slug,
        totalTickets: ticketPool.length,
      },
    });
  } catch (error) {
    console.error('❌ draw-winners error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
}
