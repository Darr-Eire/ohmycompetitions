// pages/api/pi/complete-payment.js
export default async function handler(req, res) {
    const { paymentID, txid } = req.body
    // call Pi Platform API: POST https://api.minepi.com/v2/payments/{paymentID}/complete
    // with header: Authorization: Key <YOUR_SERVER_API_KEY>
    // request body: { txid }
    // respond 200 on success
    res.status(200).end()
  }
  