// src/lib/pi.js

/**
 * Creates a Pi payment session for a competition entry.
 *
 * @param {object} options
 * @param {string} options.competitionId  Mongo _id of the competition
 * @param {number} options.amount         Entry fee, in π
 * @param {string} [options.memo]         Optional memo/description
 * @returns {Promise<string>}             A URL that your client can redirect to
 */
export async function createPiPaymentSession({ competitionId, amount, memo }) {
    // Dynamically import the Pi SDK only when this function is called
    const { default: PiSDK } = await import('@pinetwork-js/sdk')
  
    // Instantiate with your server secret key
    const pi = new PiSDK({
      apiKey: process.env.PI_API_KEY,
      secret: process.env.PI_SECRET_SEED,
    })
  
    // Build metadata to correlate payment with your DB record
    const metadata = { competitionId, timestamp: Date.now() }
  
    // Create the payment request via Pi’s SDK
    const session = await pi.createPayment({
      amount,                                      // amount in π
      memo: memo || `Entry fee for ${competitionId}`,
      metadata,                                    // attach any info you need
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/competitions/${competitionId}/verify-payment`,
    })
  
    // Return the URL your frontend should redirect the user to
    return session.paymentUrl
  }
  