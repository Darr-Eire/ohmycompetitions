import { dbConnect } from '../../../lib/dbConnect';
import AuditLog from '../../../models/AuditLog';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await dbConnect();

    // Get query parameters for filtering
    const { 
      limit = 50, 
      offset = 0, 
      action, 
      user, 
      startDate, 
      endDate,
      severity 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (action) {
      filter.action = { $regex: action, $options: 'i' };
    }
    
    if (user) {
      filter.user = { $regex: user, $options: 'i' };
    }
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    // Get audit logs with pagination
    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 }) // Most recent first
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    // Get total count for pagination
    const totalCount = await AuditLog.countDocuments(filter);

    // Format the response
    const formattedLogs = logs.map(log => ({
      id: log._id,
      timestamp: log.timestamp,
      user: log.user,
      action: log.action,
      details: log.details,
      resource: log.details ? log.details.split(' ')[0] : 'Unknown',
      ip: 'N/A', // Not stored in current model
      status: 'success' // Default status
    }));

    res.status(200).json({
      logs: formattedLogs,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: totalCount > parseInt(offset) + formattedLogs.length
      }
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
} 