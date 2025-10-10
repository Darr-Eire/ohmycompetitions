import { MongoClient } from 'mongodb';
import axios from 'axios';

const MONGODB_URI = process.env.MONGO_DB_URL;
const PI_APP_SECRET = process.env.PI_APP_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentId, txid, weekStart, quantity, userId, username } = req.body;

  if (!paymentId || !txid) {
    return res.status(400).json({ error: 'Missing paymentId or txid' });
  }

  try {
    // Complete the payment with Pi Network
    const response = await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      txid: txid
    }, {
      headers: {
        'Authorization': `Key ${PI_APP_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    const completedPayment = response.data;

    // If payment completed successfully, update our database
    if (completedPayment.status === 'completed') {
      // Call the purchase API to record the ticket purchase
      const purchaseResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/pi-cash-code-purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart,
          quantity,
          paymentId,
          txid,
          userId,
          username
        })
      });

      if (purchaseResponse.ok) {
        const purchaseResult = await purchaseResponse.json();
        res.status(200).json({
          success: true,
          message: 'Payment completed and ticket purchased successfully',
          ticketId: purchaseResult.ticketId,
          payment: completedPayment
        });
      } else {
        res.status(500).json({ error: 'Payment completed but failed to record ticket purchase' });
      }
    } else {
      res.status(400).json({ error: 'Payment completion failed' });
    }

  } catch (error) {
    console.error('Pi Cash Code payment completion error:', error);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.status(500).json({ error: 'Failed to complete payment' });
  }
} 