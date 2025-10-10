// src/pages/api/referrals/click.js
import ReferralEvent from 'models/ReferralEvent';
import User from 'models/User';
import { serialize } from 'cookie';

export default async function handler(req,res){
  const { code, deviceHash } = req.query;
  const referrer = await User.findOne({ referralCode: code });
  if (referrer) {
    // set 30d cookie
    res.setHeader('Set-Cookie', serialize('omc_ref', String(referrer._id), { path:'/', maxAge: 30*24*3600 }));
    // log click
    await ReferralEvent.create({
      referrerId: referrer._id,
      type: 'CLICK',
      deviceHash: deviceHash?.slice(0,128) || null,
      ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress
    });
  }
  res.writeHead(302, { Location: '/' }); res.end();
}
