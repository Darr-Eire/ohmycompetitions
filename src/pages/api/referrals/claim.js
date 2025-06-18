// /pages/api/referrals/claim.js
import dbConnect from 'lib/dbConnect';
import Referral from 'models/Referral';


export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await dbConnect();

  const { compSlug, referrerUsername } = req.body;
  const piUser = await getPiUserFromSession(req);

  if (!piUser?.username) return res.status(401).json({ error: 'Not logged in' });

  const existing = await Referral.findOne({ compSlug, username: piUser.username });
  if (existing) return res.status(400).json({ error: 'Already claimed' });

  await Referral.create({
    username: piUser.username,
    compSlug,
    referrer: referrerUsername || null,
    claimedAt: new Date(),
  });

  // update referrer count
  if (referrerUsername && referrerUsername !== piUser.username) {
    await Referral.updateOne(
      { username: referrerUsername, compSlug },
      { $inc: { referrals: 1 } },
      { upsert: true }
    );
  }

  res.json({ success: true });
}
