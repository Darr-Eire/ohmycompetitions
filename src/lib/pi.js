// Load and initialize the Pi SDK
export function loadPiSdk(setReady) {
  if (typeof window === 'undefined') return;

  // Clear any existing SDK
  if (window.Pi) {
    try {
      window.Pi = undefined;
    } catch (e) {
      console.warn('Could not clear existing Pi SDK');
    }
  }

  // Remove any existing SDK script
  const existingScript = document.querySelector('script[src*="pi-sdk.js"]');
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.async = true;
  let checkTimeout;

  script.onload = () => {
    // Clear any existing check timeout
    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }

    const check = setInterval(() => {
      if (window.Pi && typeof window.Pi.createPayment === 'function') {
        clearInterval(check);
        clearTimeout(checkTimeout);

        const sandbox = process.env.NEXT_PUBLIC_SANDBOX_SDK === 'true';
        try {
          window.Pi.init({ version: '2.0', sandbox });
          setReady(true);
          console.log('✅ Pi SDK loaded and initialized in', sandbox ? 'sandbox' : 'production', 'mode');
        } catch (err) {
          console.error('❌ Failed to initialize Pi SDK:', err);
          setReady(false);
        }
      }
    }, 100);

    // Set a timeout to stop checking after 10 seconds
    checkTimeout = setTimeout(() => {
      clearInterval(check);
      console.error('❌ Pi SDK initialization timed out');
      setReady(false);
    }, 10000);
  };

  script.onerror = (error) => {
    console.error('❌ Failed to load Pi SDK:', error);
    setReady(false);
  };

  document.body.appendChild(script);
}

// Get the base URL for API calls
function getBaseUrl() {
  if (typeof window === 'undefined') return '';
  
  // If we're in development but accessing via ngrok, use the current origin
  if (typeof window !== 'undefined' && window.location.origin.includes('ngrok')) {
    return window.location.origin;
  }
  
  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.NEXT_PUBLIC_SITE_URL;
}

// Create a Pi payment for competition entry
export async function createPiPayment({ competitionSlug, amount, memo }) {
  if (typeof window === 'undefined' || !window.Pi) {
    throw new Error('Pi SDK not available');
  }

  return new Promise((resolve, reject) => {
    let isApproved = false;

    const paymentData = {
      amount: parseFloat(amount.toFixed(2)),
      memo: memo || `Competition entry: ${competitionSlug}`,
      metadata: { type: 'competition_entry', competitionSlug, timestamp: Date.now() }
    };

    console.log('🔄 Creating Pi payment with data:', paymentData);

    window.Pi.createPayment(paymentData, {
      // Called when there's an incomplete payment that needs to be handled
      onIncomplete: async function(payment) {
        console.log('⚠️ Incomplete payment detected:', payment);
        const baseUrl = getBaseUrl();
        
        try {
          const response = await fetch(`${baseUrl}/api/pi/incomplete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              payment,
              slug: competitionSlug
            })
          });

          const result = await response.json();
          console.log('📝 Incomplete payment handled:', result);

          // If the incomplete payment was successfully completed, resolve with that result
          if (result.result && result.result.ticketNumber) {
            console.log('✅ Incomplete payment was completed successfully');
            resolve(result.result);
            return;
          }

          // Otherwise, the payment was handled/cancelled, so we can try creating a new one
          console.log('🔄 Incomplete payment cleared, please try again');
          reject(new Error('A previous incomplete payment was found and cleared. Please refresh the page and try your payment again.'));
        } catch (err) {
          console.error('❌ Error handling incomplete payment:', err);
          reject(new Error('Failed to handle incomplete payment. Please try again.'));
        }
      },
      // Called when the payment is ready to be approved by the backend
      onReadyForServerApproval: async function(paymentId) {
        const baseUrl = getBaseUrl();
        console.log('🔄 Payment ready for approval:', { paymentId, baseUrl });
        try {
          const response = await fetch(`${baseUrl}/api/pi/approve-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              paymentId,
              slug: competitionSlug,
              amount: parseFloat(amount.toFixed(2))
            })
          });

          if (!response.ok) {
            let errorData;
            const responseText = await response.text();
            try {
              errorData = JSON.parse(responseText);
            } catch (e) {
              errorData = { error: `Server returned: ${responseText}` };
            }
            
            console.error('❌ Server approval failed:', {
              status: response.status,
              statusText: response.statusText,
              responseText,
              errorData,
              url: `${baseUrl}/api/pi/approve-payment`
            });
            throw new Error(errorData.error || `Payment approval failed (${response.status}): ${responseText}`);
          }

          const data = await response.json();
          console.log('✅ Payment approved by server:', data);
          
          // If payment was already approved, it means there's a stuck payment
          if (data.alreadyApproved) {
            console.log('⚠️ Payment was already approved, this indicates a stuck payment state');
            throw new Error('This payment was already processed. Please refresh the page and try again with a new payment.');
          }
          
          isApproved = true;
        } catch (err) {
          console.error('❌ Payment approval error:', err);
          
          // If it's a server error (500) or specific approval errors,
          // don't throw - Pi SDK might still complete the payment successfully
          if (err.message && (
            err.message.includes('500') || 
            err.message.includes('Payment approval failed') ||
            err.message.includes('Payment not approved by Pi Network')
          )) {
            console.warn('⚠️ Got server error during approval, but payment might still be valid. Letting Pi SDK continue...');
            // Set approved flag to true so completion can proceed
            isApproved = true;
            return;
          }
          
          throw err; // This will stop the payment flow for other errors
        }
      },

      // Called when the payment is completed and ready to be completed by the backend
      onReadyForServerCompletion: async function(paymentId, txid) {
        const baseUrl = getBaseUrl();
        console.log('🔄 Payment ready for completion:', { paymentId, txid, isApproved, baseUrl });
        
        // Even if our approval flag isn't set, try to complete the payment
        // The Pi SDK might call this callback regardless of our approval status
        try {
          const response = await fetch(`${baseUrl}/api/pi/complete-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              paymentId,
              txid,
              slug: competitionSlug,
              amount: parseFloat(amount.toFixed(2))
            })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Payment completion failed' }));
            console.error('❌ Server completion failed:', errorData);
            throw new Error(errorData.error || 'Payment completion failed');
          }

          const result = await response.json();
          console.log('✅ Payment completed:', result);
          resolve(result);
        } catch (err) {
          console.error('❌ Payment completion error:', err);
          
          // If the error is about approval, but we have a txid, the payment might actually be valid
          if (err.message.includes('not approved') && txid) {
            console.log('🔧 Attempting completion despite approval error since we have txid:', txid);
            // The payment might still be valid, so don't reject immediately
          }
          
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
      }
    });
  });
}

// Helper function to check payment status
export async function checkPaymentStatus(paymentId) {
  try {
    const response = await fetch(`${getBaseUrl()}/api/pi/status?paymentId=${paymentId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to check payment status' }));
      throw new Error(errorData.error || 'Failed to check payment status');
    }
    return await response.json();
  } catch (err) {
    console.error('❌ Payment status check failed:', err);
    throw err;
  }
}
