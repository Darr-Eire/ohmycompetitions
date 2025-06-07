import dbConnect from '@/lib/dbConnect';
import PiCashCode from '@/models/PiCashCode';

export default async function handler(req, res) {
  await dbConnect();

  try {
    const latestCode = await PiCashCode.findOne().sort({ weekStart: -1 });
    if (!latestCode) {
      return res.status(404).json({ message: 'No Pi Cash Code found' });
    }
    res.status(200).json(latestCode);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}
