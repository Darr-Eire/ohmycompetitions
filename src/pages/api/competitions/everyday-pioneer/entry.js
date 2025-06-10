import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';
import { dbConnect } from 'lib/dbConnect';

import EverydayEntry from 'models/EverydayEntry'; // assuming you have this model


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { transaction, tickets } = req.body;

  if (!transaction || !tickets || tickets <= 0) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    await connectToDatabase();

    // Verify Pi transaction
    const isValid = await verifyPiTransaction(transaction);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid transaction' });
    }

    // Save to DB
    const entry = await EverydayEntry.create({
      userId,
      tickets,
      transactionId: transaction,
      createdAt: new Date()
    });

    return res.status(200).json({ message: 'Entry recorded', entry });
  } catch (err) {
    console.error('Entry creation error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
