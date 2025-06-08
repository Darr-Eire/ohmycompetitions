import { dbConnect } from 'lib/dbConnect';
import mongoose from 'mongoose';

const PiCashCodeSchema = new mongoose.Schema({
  code: { type: String, required: true },
  prizePool: { type: Number, required: true },
  weekStart: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  drawAt: { type: Date, required: true },
  claimExpiresAt: { type: Date, required: true }
}, { timestamps: true });

const PiCashCode = mongoose.models.PiCashCode || mongoose.model('PiCashCode', PiCashCodeSchema, 'picashcodes');


export default async function handler(req, res) {
  await dbConnect();

  try {
    const latestCode = await PiCashCode.findOne().sort({ createdAt: -1 });

    if (!latestCode) {
      return res.status(404).json({ message: 'No Pi Cash Code found' });
    }

    res.status(200).json({
      code: latestCode.code,
      prizePool: latestCode.prizePool,
      expiresAt: latestCode.expiresAt,
      weekStart: latestCode.weekStart,
      drawAt: latestCode.drawAt,
      claimExpiresAt: latestCode.claimExpiresAt
    });
  } catch (err) {
    console.error('Failed to load Pi Cash Code data:', err);
    res.status(500).json({ message: 'Failed to load Pi Cash Code data' });
  }
}
