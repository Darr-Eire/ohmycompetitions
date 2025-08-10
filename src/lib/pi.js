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

        const sandbox = process.env.NEXT_PUBLIC_PI_SANDBOX === 'true';
        try {
          window.Pi.init({ version: '2.0', sandbox, appId: process.env.NEXT_PUBLIC_PI_APP_ID });
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

/**
 * Create a Pi payment for entering the Stage 1 Qualifier.
 *
 * Server will:
 *  - verify + approve payment
 *  - auto-assign the best Stage-1 lobby (ignores slug)
 *  - return { slug, etaSec } which we surface as { roomSlug, etaSec }
 *
 * @param {Object} params
 * @param {string|undefined} params.competitionSlug - optional, kept for metadata/analytics
 * @param {number} params.amount - entry fee (e.g., 0.15)
 * @param {string} [params.memo] - custom memo; default provided
 * @param {string|number} params.userId - REQUIRED: your backend user identifier
 * @param {number} [params.stage=1] - should be 1 for funnel entry
 * @returns {Promise<{ ok?: boolean, paymentId?: string, roomSlug?: string, etaSec?: number, entrantsCount?: number, status?: string }>}
 */
export async function createPiPayment({ competitionSlug, amount, memo, userId, stage = 1 }) {
  if (!userId) throw new Error('Missing userId for payment');
  if (typeof window === 'undefined' || !window.Pi) {
    throw new Error('Pi SDK not available');
  }

  return new Promise((resolve, reject) => {
    let approveInfo = null; // will hold { slug, etaSec, entrantsCount, status }
    const baseUrl = getBaseUrl();

    const paymentData = {
      amount: parseFloat(Number(amount).toFixed(2)),
      memo: memo || `OMC Funnel Stage ${stage} entry${competitionSlug ? `: ${competitionSlug}` : ''}`,
      metadata: {
        type: 'funnel-entry',
        stage,
        competitionSlug: competitionSlug || null,
        timestamp: Date.now(),
      },
    };

    console.log('🔄 Creating Pi payment with data:', paymentData);

    window.Pi.createPayment(paymentData, {
      // Called when there's an incomplete payment that needs to be handled
      onIncomplete: async function (payment) {
        console.log('⚠️ Incomplete payment detected:', payment);
        try {
          const response = await fetch(`${baseUrl}/api/pi/incomplete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              payment,
              slug: competitionSlug || null,
            }),
          });

          const result = await response.json();
          console.log('📝 Incomplete payment handled:', result);

          // If the incomplete payment was successfully completed, resolve with that result
          if (result.result && (result.result.ticketNumber || result.result.roomSlug)) {
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
      onReadyForServerApproval: async function (paymentId) {
        console.log('🔄 Payment ready for approval:', { paymentId, baseUrl });
        try {
          const resp = await fetch(`${baseUrl}/api/pi/approve-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId,
              userId,
              stage,
              // slug is intentionally null so server auto-assigns the best Stage-1 lobby
              slug: null,
              amount: parseFloat(Number(amount).toFixed(2)),
              meta: { type: 'funnel-entry', competitionSlug: competitionSlug || null },
            }),
          });

          if (!resp.ok) {
            let errorData;
            const responseText = await resp.text();
            try {
              errorData = JSON.parse(responseText);
            } catch {
              errorData = { error: `Server returned: ${responseText}` };
            }

            console.error('❌ Server approval failed:', {
              status: resp.status,
              statusText: resp.statusText,
              responseText,
              errorData,
              url: `${baseUrl}/api/pi/approve-payment`,
            });
            throw new Error(errorData.error || `Payment approval failed (${resp.status}): ${responseText}`);
          }

          const data = await resp.json();
          console.log('✅ Payment approved by server:', data);

          approveInfo = {
            roomSlug: data.slug,
            etaSec: data.etaSec,
            entrantsCount: data.entrantsCount,
            status: data.status,
            paymentId,
          };

          // We resolve early with placement info so the UI can react immediately.
          // (Completion still happens in the next callback.)
          // If you prefer to resolve only after completion, comment this out.
          // resolve(approveInfo);
        } catch (err) {
          console.error('❌ Payment approval error:', err);

          // If it's a server error, let Pi SDK continue; completion may still succeed.
          if (
            err.message &&
            (err.message.includes('500') ||
              err.message.includes('Payment approval failed') ||
              err.message.includes('Payment not approved by Pi Network'))
          ) {
            console.warn('⚠️ Server approval error; continuing to completion phase...');
            return;
          }

          // Hard error → stop the flow
          reject(err);
        }
      },

      // Called when the payment is completed and ready to be completed by the backend
      onReadyForServerCompletion: async function (paymentId, txid) {
        console.log('🔄 Payment ready for completion:', { paymentId, txid, baseUrl });

        try {
          const resp = await fetch(`${baseUrl}/api/pi/complete-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId,
              txid,
              userId,
              stage,
              amount: parseFloat(Number(amount).toFixed(2)),
              meta: { type: 'funnel-entry', competitionSlug: competitionSlug || null },
            }),
          });

          if (!resp.ok) {
            const responseText = await resp.text();
            console.error('❌ Payment completion failed:', {
              status: resp.status,
              statusText: resp.statusText,
              responseText,
              url: `${baseUrl}/api/pi/complete-payment`,
            });
            throw new Error(`Payment completion failed (${resp.status}): ${responseText}`);
          }

          const result = await resp.json();
          console.log('✅ Payment completed successfully:', result);

          // Merge placement info from approval (roomSlug, etaSec) if we have it
          resolve({
            ...(approveInfo || {}),
            ...result,
            ok: true,
            paymentId,
            txid,
          });
        } catch (err) {
          console.error('❌ Payment completion error:', err);
          reject(new Error(`Payment completion failed: ${err.message}`));
        }
      },

      // Called when payment is cancelled
      onCancel: function (paymentId) {
        console.log('❌ Payment cancelled by user:', paymentId);
        reject(new Error('Payment was cancelled by user'));
      },

      // Called when there's an error with the payment
      onError: function (error, payment) {
        console.error('❌ Payment error:', error, payment);
        reject(new Error(`Payment error: ${error?.message || error?.type || 'Unknown error'}`));
      },
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
