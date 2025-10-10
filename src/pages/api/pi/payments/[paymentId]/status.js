import { dbConnect } from '../../../../../lib/dbConnect';
import PiPayment from '../../../../../models/PiPayment';
export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).end();
  await dbConnect();
  const rec = await PiPayment.findOne({ paymentId: req.query.paymentId });
  if(!rec) return res.status(404).json({ message:'Unknown paymentId' });
  res.json({ status: rec.status, txid: rec.txid });
}
