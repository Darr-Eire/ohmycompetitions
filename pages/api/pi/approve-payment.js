// pages/api/pi/approve-payment.js
export default async function handler(req, res) {
    const { paymentID } = req.body
    // call Pi Platform API: POST https://api.minepi.com/v2/payments/{paymentID}/approve
    // with header: Authorization: Key <YOUR_SERVER_API_KEY>
    // request body: { payment: { developer_approved: true } }
    // respond 200 on success
    res.status(200).end()
  }
  