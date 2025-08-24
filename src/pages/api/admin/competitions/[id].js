// File: src/pages/api/admin/competitions/[id].js

import dbConnect from '@lib/dbConnect';
import Competition from '@models/Competition';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  try {
    // --- Basic Auth (challenge) ---
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="OMC Admin", charset="UTF-8"');
      return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    // Decode "username:password" (support ':' inside password)
    const base64Credentials = authHeader.split(' ')[1] || '';
    let decoded = '';
    try {
      decoded = Buffer.from(base64Credentials, 'base64').toString('utf8');
    } catch {
      return res.status(400).json({ message: 'Invalid base64 credentials' });
    }
    const sepIndex = decoded.indexOf(':');
    if (sepIndex === -1) {
      return res.status(400).json({ message: 'Malformed credentials' });
    }
    const username = decoded.slice(0, sepIndex);
    const password = decoded.slice(sepIndex + 1);

    // Env creds (supports either pair if you want)
    const ADMIN_USER =
      (process.env.ADMIN_USER || process.env.ADMIN_USERNAME || 'OhMyAdmin').trim();
    const ADMIN_PASS =
      (process.env.ADMIN_PASS || process.env.ADMIN_PASSWORD || 'admin123456').trim();

    if (username !== ADMIN_USER || password !== ADMIN_PASS) {
      return res.status(403).json({ message: 'Forbidden: Invalid credentials' });
    }

    // --- No-cache for admin endpoints ---
    res.setHeader('Cache-Control', 'no-store');

    // --- Validate ID ---
    const { id } = req.query;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid competition ID' });
    }
    const objectId = new mongoose.Types.ObjectId(id);

    // --- DB connect (after auth succeeds) ---
    await dbConnect();

    // --- Methods ---
    if (req.method === 'GET') {
      const competition = await Competition.findById(objectId).lean();
      if (!competition) return res.status(404).json({ message: 'Competition not found' });
      return res.status(200).json({ success: true, competition });
    }

    if (req.method === 'PUT') {
      // Optional: whitelist fields to prevent accidental overwrites
      // const { title, description, status, prizePool, ... } = req.body;
      // const update = { title, description, status, prizePool, ... };

      const update = req.body || {};
      const updated = await Competition.findByIdAndUpdate(objectId, update, {
        new: true,
        runValidators: true,
      }).lean();

      if (!updated) return res.status(404).json({ message: 'Competition not found' });
      return res.status(200).json({ success: true, competition: updated });
    }

    if (req.method === 'DELETE') {
      const deleted = await Competition.findByIdAndDelete(objectId);
      if (!deleted) return res.status(404).json({ message: 'Competition not found' });
      return res.status(200).json({ success: true, message: 'Competition deleted successfully' });
    }

    // --- Unsupported method ---
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });

  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
