import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

const client = new MongoClient(process.env.MONGO_DB_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { competition, recipient, quantity, entryFee, purchaseNew } = req.body;

  if (!competition || !recipient || !quantity || quantity < 1) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await client.connect();
    const db = client.db();

    // Find competition to get slug and other details
    const comp = await db.collection('competitions').findOne({
      title: competition
    });

    if (!comp) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    // Check if recipient user exists
    const recipientUser = await db.collection('users').findOne({
      username: recipient
    });

    if (!recipientUser) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    // Generate ticket numbers
    const ticketNumbers = Array.from({ length: quantity }, () =>
      `GFT-${Math.floor(Math.random() * 1000000)}`
    );

    // Create ticket record
    const newTicket = {
      username: recipient,
      competitionSlug: comp.comp.slug,
      competitionTitle: comp.title,
      imageUrl: comp.imageUrl || '/images/default.jpg',
      quantity: parseInt(quantity),
      ticketNumbers,
      purchasedAt: new Date(),
      gifted: true,
      giftedBy: 'system' // In a real implementation, this would be the current user
    };

    await db.collection('tickets').insertOne(newTicket);

    res.status(200).json({
      success: true,
      message: `Successfully gifted ${quantity} ticket(s) to ${recipient}`,
      ticket: newTicket
    });

  } catch (err) {
    console.error('Purchase and gift error:', err);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    await client.close();
  }
} 