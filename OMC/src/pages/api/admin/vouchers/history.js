// pages/api/admin/vouchers/history.js
import { dbConnect } from '../../../../lib/dbConnect';
import Voucher from '../../../../models/Voucher';
import VoucherRedemption from '../../../../models/VoucherRedemption';
import { requireAdmin } from '../_adminAuth';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  
  // Check admin authentication
  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    await dbConnect();

    const { 
      limit = 50, 
      offset = 0, 
      competitionSlug, 
      userId, 
      startDate, 
      endDate 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (competitionSlug) {
      filter.competitionSlug = competitionSlug;
    }
    
    if (userId) {
      filter.userId = userId;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Get voucher redemptions with pagination
    const redemptions = await VoucherRedemption.find(filter)
      .populate('voucherId', 'codeDisplay batchId competitionSlug ticketCount notes')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    // Get total count for pagination
    const totalCount = await VoucherRedemption.countDocuments(filter);

    // Format the response
    const formattedRedemptions = redemptions.map(redemption => ({
      id: redemption._id,
      voucherCode: redemption.voucherId?.codeDisplay || 'Unknown',
      batchId: redemption.voucherId?.batchId || 'Unknown',
      userId: redemption.userId,
      competitionSlug: redemption.competitionSlug,
      ticketCount: redemption.ticketCount,
      redeemedAt: redemption.createdAt,
      userAgent: redemption.userAgent || 'N/A',
      ip: redemption.ip || 'N/A',
      notes: redemption.voucherId?.notes || ''
    }));

    res.status(200).json({
      redemptions: formattedRedemptions,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: totalCount > parseInt(offset) + formattedRedemptions.length
      }
    });

  } catch (error) {
    console.error('Error fetching voucher history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

