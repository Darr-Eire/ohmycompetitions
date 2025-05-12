export default async function handler(req, res) {
  const { paymentId } = req.body;
  // Optional: validate paymentId or check if user is allowed
  console.log('🔐 Approving payment:', paymentId);
  return res.status(200).json({ success: true });
}
