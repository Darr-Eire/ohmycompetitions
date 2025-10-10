// pages/api/admin/log.js
import { dbConnect } from '../../../lib/dbConnect';
import AuditLog from '../../../models/AuditLog';
import { requireAdmin } from './_adminAuth';

export default async function handler(req, res) {
  // Check admin authentication
  const admin = requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'POST') {
    // Log an admin action
    try {
      await dbConnect();

      const { action, details, resource, severity = 'info' } = req.body;

      if (!action) {
        return res.status(400).json({ error: 'Action is required' });
      }

      const logEntry = await AuditLog.create({
        user: admin.user || 'admin',
        action,
        details: details || `${action} performed on ${resource || 'system'}`,
        timestamp: new Date(),
        severity,
        resource: resource || 'system'
      });

      res.status(201).json({ 
        success: true, 
        logId: logEntry._id,
        message: 'Action logged successfully' 
      });

    } catch (error) {
      console.error('Error logging admin action:', error);
      res.status(500).json({ error: 'Failed to log action' });
    }
  } else if (req.method === 'GET') {
    // Get recent admin logs
    try {
      await dbConnect();

      const { limit = 50, offset = 0, action, user, startDate, endDate } = req.query;

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

      // Get logs with pagination
      const logs = await AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .lean();

      // Get total count for pagination
      const totalCount = await AuditLog.countDocuments(filter);

      res.status(200).json({
        logs,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: totalCount > parseInt(offset) + logs.length
        }
      });

    } catch (error) {
      console.error('Error fetching admin logs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}

