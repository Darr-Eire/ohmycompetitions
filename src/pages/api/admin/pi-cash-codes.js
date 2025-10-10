import { dbConnect } from '../../../lib/dbConnect';
import PiCashCode from '../../../models/PiCashCode';

export default async function handler(req, res) {
  await dbConnect();

  // Skip auth for testing - can be re-enabled later
  // const session = await getServerSession(req, res, authOptions);
  // if (!session || session.user?.role !== 'admin') {
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }

  if (req.method === 'GET') {
    try {
      const codes = await PiCashCode.find({})
        .sort({ weekStart: -1 })
        .lean();
      
      return res.status(200).json(codes);
    } catch (error) {
      console.error('Error fetching Pi Cash Codes:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { code, weekStart, prizePool, expiresAt, drawAt, claimExpiresAt } = req.body;
      
      // Validate required fields
      if (!code || !weekStart || !prizePool || !expiresAt || !drawAt || !claimExpiresAt) {
        return res.status(400).json({ 
          message: 'Missing required fields: code, weekStart, prizePool, expiresAt, drawAt, claimExpiresAt' 
        });
      }

      // Check if code already exists
      const existingCode = await PiCashCode.findOne({ code });
      if (existingCode) {
        return res.status(409).json({ 
          message: `Code "${code}" already exists. Please use a different code.` 
        });
      }

      const newCode = await PiCashCode.create({
        code,
        weekStart: new Date(weekStart),
        prizePool: parseInt(prizePool),
        expiresAt: new Date(expiresAt),
        drawAt: new Date(drawAt),
        claimExpiresAt: new Date(claimExpiresAt),
        ticketsSold: 0,
        claimed: false,
        winner: null,
        claimAttempts: [],
        rolloverFrom: null
      });

      console.log('Pi Cash Code created:', newCode);
      return res.status(201).json(newCode);
    } catch (error) {
      console.error('Error creating Pi Cash Code:', error);
      
      // Handle duplicate key errors
      if (error.code === 11000) {
        return res.status(409).json({ 
          message: 'Code already exists. Please use a different code.' 
        });
      }
      
      return res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const updates = req.body;
      
      const updatedCode = await PiCashCode.findByIdAndUpdate(id, updates, { new: true });
      
      if (!updatedCode) {
        return res.status(404).json({ message: 'Code not found' });
      }
      
      return res.status(200).json(updatedCode);
    } catch (error) {
      console.error('Error updating Pi Cash Code:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      
      const deletedCode = await PiCashCode.findByIdAndDelete(id);
      
      if (!deletedCode) {
        return res.status(404).json({ message: 'Code not found' });
      }
      
      return res.status(200).json({ message: 'Code deleted successfully' });
    } catch (error) {
      console.error('Error deleting Pi Cash Code:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end();
} 