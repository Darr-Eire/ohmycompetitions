import { dbConnect } from '@lib/dbConnect';
import Competition from '@models/Competition';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  try {
    await dbConnect();
    
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    // Extract and verify token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Missing token' });
    }

    // Verify admin token (you should implement proper token verification)
    // For now, we'll just check if it matches what we store in localStorage
    // In a real app, you should verify JWT or session token
    try {
      // Here you would verify the token
      // For example: const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // For now, we'll assume if they have a token, they're authenticated
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { id } = req.query;

    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(id);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid competition ID' });
    }

    if (req.method === 'GET') {
      const competition = await Competition.findById(objectId);
      if (!competition) {
        return res.status(404).json({ message: 'Competition not found' });
      }
      return res.status(200).json(competition);
    }

    if (req.method === 'PUT') {
      const update = req.body;
      const updatedCompetition = await Competition.findByIdAndUpdate(objectId, update, { new: true });
      if (!updatedCompetition) {
        return res.status(404).json({ message: 'Competition not found' });
      }
      return res.status(200).json(updatedCompetition);
    }

    if (req.method === 'DELETE') {
      const deletedCompetition = await Competition.findByIdAndDelete(objectId);
      if (!deletedCompetition) {
        return res.status(404).json({ message: 'Competition not found' });
      }
      return res.status(200).json({ message: 'Competition deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
