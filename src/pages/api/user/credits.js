// src/pages/api/user/credits.js
import { dbConnect } from '../../../lib/dbConnect';
import TicketCredit from '../../../models/TicketCredit';
import Voucher from '../../../models/Voucher';
import Competition from '../../../models/Competition';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await dbConnect();

    const { userId, username } = req.query;

    if (!userId && !username) {
      return res.status(400).json({ message: 'userId or username required' });
    }

    // Find user's ticket credits
    const credits = await TicketCredit.find({
      $or: [
        { userId: userId },
        { username: username }
      ]
    }).sort({ createdAt: -1 });

    // Get voucher redemptions for this user
    const vouchers = await Voucher.find({
      'redemptions.userId': userId || username,
      'redemptions.username': username || userId
    }).select('codeDisplay competitionSlug ticketCount redemptions createdAt');

    // Process voucher redemptions
    const voucherHistory = vouchers.flatMap(voucher => 
      voucher.redemptions
        .filter(redemption => 
          redemption.userId === (userId || username) || 
          redemption.username === (username || userId)
        )
        .map(redemption => ({
          code: voucher.codeDisplay || 'HIDDEN',
          competitionSlug: voucher.competitionSlug,
          ticketCount: voucher.ticketCount,
          redeemedAt: redemption.redeemedAt,
          quantity: redemption.quantity
        }))
    ).sort((a, b) => new Date(b.redeemedAt) - new Date(a.redeemedAt));

    // Get competition details for credits and vouchers
    const competitionSlugs = [
      ...new Set([
        ...credits.map(c => c.competitionSlug),
        ...voucherHistory.map(v => v.competitionSlug)
      ])
    ];

    const competitions = await Competition.find({
      'comp.slug': { $in: competitionSlugs }
    }).select('comp.slug title comp.status comp.endsAt');

    const competitionMap = competitions.reduce((acc, comp) => {
      acc[comp.comp.slug] = {
        title: comp.title,
        status: comp.comp.status,
        endsAt: comp.comp.endsAt
      };
      return acc;
    }, {});

    // Process credits with competition details
    const processedCredits = credits.map(credit => ({
      ...credit.toObject(),
      competition: competitionMap[credit.competitionSlug] || {
        title: 'Unknown Competition',
        status: 'unknown',
        endsAt: null
      }
    }));

    // Process voucher history with competition details
    const processedVoucherHistory = voucherHistory.map(voucher => ({
      ...voucher,
      competition: competitionMap[voucher.competitionSlug] || {
        title: 'Unknown Competition',
        status: 'unknown',
        endsAt: null
      }
    }));

    res.status(200).json({
      success: true,
      credits: processedCredits,
      voucherHistory: processedVoucherHistory,
      stats: {
        totalCredits: credits.length,
        totalVoucherRedemptions: voucherHistory.length,
        totalTicketsFromCredits: credits.reduce((sum, c) => sum + (c.quantity || 0), 0),
        totalTicketsFromVouchers: voucherHistory.reduce((sum, v) => sum + (v.quantity || 0), 0)
      }
    });

  } catch (error) {
    console.error('Error fetching user credits:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

