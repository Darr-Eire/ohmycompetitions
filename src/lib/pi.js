// Load and initialize the Pi SDK
export function loadPiSdk(setReady) {
  if (typeof window === 'undefined') return;

  if (window.Pi && typeof window.Pi.createPayment === 'function') {
    const sandbox = process.env.NODE_ENV === 'development';
    window.Pi.init({ version: '2.0', sandbox });
    setReady(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.async = true;

  script.onload = () => {
    const check = setInterval(() => {
      if (window.Pi && typeof window.Pi.createPayment === 'function') {
        clearInterval(check);

        const sandbox = process.env.NODE_ENV === 'development';
        window.Pi.init({ version: '2.0', sandbox });

        setReady(true);
        console.log('✅ Pi SDK loaded in', sandbox ? 'sandbox' : 'production', 'mode');
      }
    }, 100);
  };

  document.body.appendChild(script);
}

// Create a Pi payment for competition entry
export async function createPiPayment({ competitionId, amount, memo }) {
  if (typeof window === 'undefined' || !window.Pi) {
    throw new Error('Pi SDK not available');
  }

  return new Promise((resolve, reject) => {
    const paymentData = {
      amount,
      memo,
      metadata: { competitionId }
    };

    window.Pi.createPayment(paymentData, {
      // Called when the payment is ready to be approved by the backend
      onReadyForServerApproval: async function(paymentId) {
        console.log('🔄 Payment ready for approval:', paymentId);
        try {
          const response = await fetch('/api/pi/approve-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, competitionId })
          });

          if (!response.ok) {
            throw new Error('Payment approval failed');
          }

          console.log('✅ Payment approved by server');
        } catch (err) {
          console.error('❌ Payment approval error:', err);
          reject(err);
        }
      },

      // Called when the payment is completed and ready to be completed by the backend
      onReadyForServerCompletion: async function(paymentId, txid) {
        console.log('🔄 Payment ready for completion:', { paymentId, txid });
        try {
          const response = await fetch('/api/pi/complete-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid, competitionId })
          });

          if (!response.ok) {
            throw new Error('Payment completion failed');
          }

          const result = await response.json();
          console.log('✅ Payment completed:', result);
          resolve(result);
        } catch (err) {
          console.error('❌ Payment completion error:', err);
          reject(err);
        }
      },

      // Called when the user cancels the payment
      onCancel: function(paymentId) {
        console.log('❌ Payment cancelled:', paymentId);
        reject(new Error('Payment cancelled by user'));
      },

      // Called when there's a payment error
      onError: function(error, paymentId) {
        console.error('❌ Payment error:', error, paymentId);
        reject(error);
      },

      // Called when there's an incomplete payment
      onIncomplete: function(payment) {
        console.warn('⚠️ Incomplete payment found:', payment);
        // Try to handle the incomplete payment
        fetch('/api/pi/incomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment, competitionId })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to handle incomplete payment');
          }
          return response.json();
        })
        .then(result => {
          console.log('✅ Handled incomplete payment:', result);
          resolve(result);
        })
        .catch(err => {
          console.error('❌ Failed to handle incomplete payment:', err);
          reject(err);
        });
      }
    });
  });
}

// Helper function to check payment status
export async function checkPaymentStatus(paymentId) {
  try {
    const response = await fetch(`/api/pi/status?paymentId=${paymentId}`);
    if (!response.ok) throw new Error('Failed to check payment status');
    return await response.json();
  } catch (err) {
    console.error('❌ Payment status check failed:', err);
    throw err;
  }
}
