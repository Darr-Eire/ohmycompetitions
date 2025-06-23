import { dbConnect } from 'lib/dbConnect';
import Battle from 'models/Battle';

export default async function handler(req, res) {
  await dbConnect();

  const now = new Date();

  const [upcoming, running, ended, recentWins, topRoyale] = await Promise.all([
    Battle.find({ startTime: { $gt: now } }).sort({ startTime: 1 }).limit(6),
    Battle.find({ status: 'live' }).sort({ createdAt: -1 }).limit(6),
    Battle.find({ status: 'ended' }).sort({ createdAt: -1 }).limit(6),
    Battle.find({ status: 'ended' }).sort({ createdAt: -1 }).limit(6).select('winner type createdAt'),
    Battle.aggregate([
      { $match: { type: 'royale', status: 'ended', winner: { $ne: null } } },
      { $group: {
          _id: '$winner',
          wins: { $sum: 1 }
        }
      },
      { $sort: { wins: -1 } },
      { $limit: 5 }
    ])
  ]);

  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 60000);
    return diff < 1 ? 'just now' : `${diff} min${diff > 1 ? 's' : ''} ago`;
  };

  res.status(200).json({
    upcoming: upcoming.map(b => ({ id: b._id, type: b.type, time: new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })),
    running: running.map(b => ({ id: b._id, type: b.type, round: b.round })),
    ended: ended.map(b => ({ id: b._id, type: b.type, winner: b.winner })),
    recentWins: recentWins.map(w => ({ player: w.winner, type: w.type, time: formatTime(w.createdAt) })),
    topRoyale: topRoyale.map((p, i) => ({ name: p._id, wins: p.wins, rank: i + 1 })),
  });
}
