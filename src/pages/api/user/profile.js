import { connectToDatabase } from 'lib/dbConnect';
import User from 'models/User';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_DB_URL);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { uid } = req.query;

  if (!uid) {
    return res.status(400).json({ message: 'Missing uid parameter' });
  }

  try {
    await client.connect();
    const db = client.db();

    // Get user data from MongoDB collections
    const user = await db.collection('users').findOne({ uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get payments/tickets count from payments collection
    const payments = await db.collection('payments').find({ 
      uid,
      status: 'completed'
    }).toArray();

    // Get tickets from tickets collection (for gifted tickets)
    const tickets = await db.collection('tickets').find({
      username: user.username
    }).toArray();

    // Calculate stats
    const totalPurchased = payments.reduce((sum, payment) => {
      return sum + (payment.ticketQuantity || 1);
    }, 0);

    const totalGifted = tickets.filter(t => t.gifted).reduce((sum, ticket) => {
      return sum + (ticket.quantity || 1);
    }, 0);

    const totalEarned = user.bonusTickets || 0;

    // Get referral stats
    const referralStats = await db.collection('referrals').aggregate([
      { $match: { referrer: user.username } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]).toArray();

    const referralCount = referralStats.length > 0 ? referralStats[0].count : 0;

    res.status(200).json({
      user: {
        username: user.username,
        uid: user.uid,
        country: user.country || 'Unknown',
        createdAt: user.createdAt,
        referralCode: user.referralCode
      },
      stats: {
        totalPurchased,
        totalGifted,
        totalEarned,
        joinedDate: user.createdAt
      },
      referrals: {
        signupCount: referralCount,
        ticketsEarned: totalEarned,
        miniGamesBonus: 0 // This would need game results tracking
      }
    });

  } catch (err) {
    console.error('Profile API error:', err);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    await client.close();
  }
} 