import axios from 'axios';

export async function verifyPayment({ paymentId, transaction, expectedAmount, username, reason = '' }) {
  try {
    const response = await axios.get(`https://api.minepi.com/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.PI_API_SECRET_KEY}`
      }
    });

    const data = response.data;

    // Basic checks
    if (
      data &&
      data.identifier === paymentId &&
      data.status === 'COMPLETED' &&
      parseFloat(data.amount) >= parseFloat(expectedAmount)
    ) {
      console.log(`✅ Verified Pi payment: ${paymentId} for ${username} (${reason})`);
      return true;
    }

    console.warn('❌ Pi payment verification failed:', {
      paymentId,
      expected: expectedAmount,
      actual: data?.amount,
      status: data?.status
    });

    return false;
  } catch (error) {
    console.error('❌ Error verifying Pi payment:', error?.message || error);
    return false;
  }
}
