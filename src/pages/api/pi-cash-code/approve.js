import { MongoClient } from 'mongodb';
import axios from 'axios';

const MONGODB_URI = process.env.MONGO_DB_URL;
const PI_APP_SECRET = process.env.PI_APP_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'Missing paymentId' });
  }

  try {
    // Verify payment with Pi Network
    const response = await axios.get(`https://api.minepi.com/v2/payments/${paymentId}`, {
      headers: {
        'Authorization': `Key ${PI_APP_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    const payment = response.data;

    // Check if payment is in correct state
    if (payment.status !== 'ready_for_completion') {
      return res.status(400).json({ error: 'Payment not ready for completion' });
    }

    // Approve the payment
    const approveResponse = await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {}, {
      headers: {
        'Authorization': `Key ${PI_APP_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json({ 
      success: true, 
      message: 'Payment approved successfully',
      payment: approveResponse.data
    });

  } catch (error) {
    console.error('Pi Cash Code payment approval error:', error);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.status(500).json({ error: 'Failed to approve payment' });
  }
} 