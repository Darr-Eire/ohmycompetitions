// src/pages/api/debug/ping.js
import { dbConnect } from '../../../lib/dbConnect';
import PiPayment from '../../../models/PiPayment';
export default async function handler(req, res) {
  try {
    await dbConnect();
    const n = await PiPayment.countDocuments().catch(() => -1);
    res.json({ ok:true, mongo:true, payments:n });
  } catch (e) {
    res.status(500).json({ ok:false, mongo:false, error:e.message });
  }
}
