// pages/api/approve.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { paymentId } = req.body;
  // Validate and approve
  console.log('Approving payment ID:', paymentId);

  // Your logic here (optional DB update, etc.)

  res.status(200).json({ success: true });
}
