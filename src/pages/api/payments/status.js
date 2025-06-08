import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { userUid } = req.query;
  const appAccessKey = process.env.PI_API_KEY;

  try {
    const { data } = await axios.get(
      `https://sandbox.minepi.com/v2/payments?user_uid=${userUid}`,   // <-- SANDBOX
      { headers: { Authorization: `Key ${appAccessKey}` } }
    );

    const latest = data?.data?.[0];
    const pending = latest && ['INCOMPLETE', 'PENDING'].includes(latest.status);

    res.status(200).json({ pending });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Status check failed' });
  }
}
