import axios from 'axios';
import initCORS from '../../../lib/cors';

const PI_API_KEY = process.env.PI_API_KEY;
const PI_API_URL = process.env.NODE_ENV === 'development' 
  ? 'https://api.minepi.com/v2/payments' 
  : 'https://api.minepi.com/v2/payments';

if (!PI_API_KEY) {
  throw new Error(
    'Please define the PI_API_KEY environment variable inside .env.local'
  );
}

export default async function handler(req, res) {
  try {
    // Handle CORS
    const shouldEndRequest = await initCORS(req, res);
    if (shouldEndRequest) {
      return;
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    console.log('🔄 Attempting to clear stuck payment:', paymentId);

    try {
      // First check the payment status
      const statusResponse = await axios.get(
        `${PI_API_URL}/${paymentId}`,
        {
          headers: { 
            'Authorization': `Key ${PI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const paymentStatus = statusResponse.data;
      console.log('📝 Payment status:', paymentStatus);

      // If it's already completed, no need to cancel
      if (paymentStatus.status?.developer_completed) {
        return res.status(200).json({ 
          message: 'Payment is already completed',
          status: paymentStatus.status
        });
      }

      // Try to cancel the payment
      const cancelResponse = await axios.post(
        `${PI_API_URL}/${paymentId}/cancel`,
        {},
        {
          headers: { 
            'Authorization': `Key ${PI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📝 Cancel response:', cancelResponse.data);

      res.status(200).json({ 
        message: 'Payment cancelled successfully',
        paymentId,
        response: cancelResponse.data
      });

    } catch (piError) {
      console.error('❌ Pi Network error:', piError);
      
      if (piError.response?.status === 404) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      res.status(500).json({ 
        error: 'Failed to clear payment',
        details: piError.response?.data?.message || piError.message
      });
    }

  } catch (error) {
    console.error('❌ Clear stuck payment error:', error);
    res.status(500).json({ 
      error: 'Failed to clear stuck payment',
      details: error.message 
    });
  }
} 