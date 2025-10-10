import { dbConnect } from '../../../../lib/dbConnect';
import Competition from '../../../../models/Competition';
import mongoose from 'mongoose';
import { requireAdmin } from '../_adminAuth';

export default async function handler(req, res) {
  try {
    await dbConnect();

    // Check admin authentication
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const { id } = req.query;

    // Validate ID
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(id);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid competition ID' });
    }

    if (req.method === 'GET') {
      const competition = await Competition.findById(objectId).lean();
      if (!competition) {
        return res.status(404).json({ message: 'Competition not found' });
      }

      return res.status(200).json({ success: true, competition });
    }

    if (req.method === 'PUT') {
      const update = req.body;
      const updatedCompetition = await Competition.findByIdAndUpdate(objectId, update, { new: true }).lean();
      if (!updatedCompetition) {
        return res.status(404).json({ message: 'Competition not found' });
      }

      return res.status(200).json({ success: true, competition: updatedCompetition });
    }

    if (req.method === 'DELETE') {
      const deletedCompetition = await Competition.findByIdAndDelete(objectId);
      if (!deletedCompetition) {
        return res.status(404).json({ message: 'Competition not found' });
      }

      return res.status(200).json({ success: true, message: 'Competition deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
