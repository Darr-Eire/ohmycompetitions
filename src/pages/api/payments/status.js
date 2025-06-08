import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { userUid } = req.query;
  if (!userUid) return res.status(400).json({ error: 'Missing userUid' });

  try {
    const appAccessKey = process.env.PI_API_KEY;

    const { data } = await axios.get(
      `https://api.minepi.com/v2/payments?user_uid=${userUid}`,
      { headers: { Authorization: `Key ${appAccessKey}` } }
    );

    if (!data.data || data.data.length === 0) {
      return res.status(200).json({ pending: false });
    }

    const latestPayment = data.data[0];
    const isPending = ['INCOMPLETE', 'PENDING'].includes(latestPayment.status);

    res.status(200).json({ pending: isPending, payment: latestPayment });
  } catch (err) {
    console.error('Status check error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
