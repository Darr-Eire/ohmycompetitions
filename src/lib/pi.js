// lib/pi.js
import PiSDK from '@pinetwork-js/sdk'  // or whatever your package is

// instantiate with your server secret key
const pi = new PiSDK({
  apiKey: process.env.PI_API_KEY,
  secret: process.env.PI_SECRET_SEED,
})

export async function createPiPaymentSession({ competitionId, amount, memo }) {
  // 1. Build whatever metadata you need to tie this payment to the competition & user
  const metadata = { competitionId, timestamp: Date.now() }

  // 2. Call Pi’s API to create an invoice or payment request
  const session = await pi.createPayment({
    amount,                // in π
    memo,                  // e.g. “Entry fee for COMPETITION_123”
    metadata,              // your custom object
    callbackUrl: `${process.env.NEXTAUTH_URL}/api/competitions/${competitionId}/verify-payment`
  })

  // 3. Pi’s SDK might return { paymentUrl, qrCodeData, expiresAt, ... }
  return session.paymentUrl
}
