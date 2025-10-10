// pages/api/admin/vouchers/list.js
import { dbConnect } from '../../../../lib/dbConnect';
import Voucher from '../../../../models/Voucher';
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
      batchId, 
      status = 'all' 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (competitionSlug) {
      filter.competitionSlug = competitionSlug;
    }
    
    if (batchId) {
      filter.batchId = batchId;
    }

    // Add status filter
    const now = new Date();
    if (status === 'active') {
      filter.$and = [
        { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
        { $expr: { $lt: ['$redeemedCount', '$maxRedemptions'] } }
      ];
    } else if (status === 'expired') {
      filter.expiresAt = { $lte: now };
    } else if (status === 'fully_redeemed') {
      filter.$expr = { $gte: ['$redeemedCount', '$maxRedemptions'] };
    }

    // Get vouchers with pagination
    const vouchers = await Voucher.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    // Get total count for pagination
    const totalCount = await Voucher.countDocuments(filter);

    // Format the response
    const formattedVouchers = vouchers.map(voucher => ({
      id: voucher._id,
      codeDisplay: voucher.codeDisplay,
      batchId: voucher.batchId,
      competitionSlug: voucher.competitionSlug,
      ticketCount: voucher.ticketCount,
      maxRedemptions: voucher.maxRedemptions,
      redeemedCount: voucher.redeemedCount,
      perUserLimit: voucher.perUserLimit,
      assignedToUserId: voucher.assignedToUserId,
      expiresAt: voucher.expiresAt,
      createdBy: voucher.createdBy,
      notes: voucher.notes,
      createdAt: voucher.createdAt,
      lastRedeemedAt: voucher.lastRedeemedAt,
      isActive: !voucher.expiresAt || voucher.expiresAt > now,
      isFullyRedeemed: voucher.redeemedCount >= voucher.maxRedemptions,
      redemptions: voucher.redemptions || []
    }));

    res.status(200).json({
      vouchers: formattedVouchers,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: totalCount > parseInt(offset) + formattedVouchers.length
      }
    });

  } catch (error) {
    console.error('Error fetching vouchers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

