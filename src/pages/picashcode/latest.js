import { dbConnect } from 'lib/dbConnect';
import PiCashCode from 'models/PiCashCode';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await dbConnect();

    const latestCode = await PiCashCode.findOne().sort({ weekStart: -1 });

    if (!latestCode) {
      return res.status(404).json({ message: 'No Pi Cash Code found' });
    }

    return res.status(200).json(latestCode);
  } catch (err) {
    console.error('❌ Error fetching PiCashCode:', err);
    return res.status(500).json({ message: 'Server Error', detail: err.message });
  }
}
