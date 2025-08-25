// Attach referrer on first login + log SIGNUP
import dbConnect from 'lib/dbConnect';
import User from 'models/User';
import ReferralEvent from 'models/ReferralEvent';

function getCookie(req, name) {
  const raw = req.headers.cookie || '';
  const parts = raw.split(';').map(s => s.trim());
  const item = parts.find(p => p.startsWith(name + '='));
  return item ? decodeURIComponent(item.split('=')[1]) : null;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    await dbConnect();

    const { piUserId, username, email, deviceHash } = req.body; // sent from client after Pi.authenticate()
    if (!piUserId) return res.status(400).json({ error: 'MISSING_PI_USER' });

    // upsert user (or however you already do it)
    let user = await User.findOne({ piUserId });
    if (!user) {
      user = await User.create({ piUserId, username: username || 'Pioneer', email });
    }

    // read referral cookie set by /api/referrals/click
    const referrerId = getCookie(req, 'omc_ref');

    // attach referrerId ONLY if not self and not already set
    if (referrerId && !user.referrerId && String(referrerId) !== String(user._id)) {
      user.referrerId = referrerId;
      await user.save();

      // log SIGNUP event
      await ReferralEvent.create({
        referrerId,
        refereeId: user._id,
        type: 'SIGNUP',
        deviceHash: deviceHash?.slice(0,128) || null,
        ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress
      });
    }

    // TODO: set your session/cookie here if needed

    return res.json({ ok: true, userId: user._id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
}
