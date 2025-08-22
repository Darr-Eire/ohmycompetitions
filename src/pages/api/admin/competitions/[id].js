import { dbConnect } from '@lib/dbConnect';
import Competition from '@models/Competition';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  try {
    await dbConnect();

    // Basic Auth: Authorization: Basic base64(username:password)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    // ✅ Replace these with your admin credentials
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'secret123';

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(403).json({ message: 'Forbidden: Invalid credentials' });
    }

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
