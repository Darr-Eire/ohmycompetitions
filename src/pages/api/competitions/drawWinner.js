export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // TODO: Replace with real winner selection logic
    const winner = {
      uid: 'xxx', // Replace this with actual Pi UID
      competitionSlug: 'abc', // Replace with actual competition slug
    };

    // Send Pi reward
    const payoutRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/rewards/send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1.5,
          recipient_uid: winner.uid,
          metadata: {
            competitionSlug: winner.competitionSlug,
            type: 'auto_reward',
          },
        }),
      }
    );

    const payoutResult = await payoutRes.json();

    if (!payoutRes.ok) {
      console.error('❌ Failed to send Pi to winner:', payoutResult.error);
      return res.status(500).json({ error: payoutResult.error });
    }

    console.log('✅ Pi reward sent:', payoutResult);
    return res.status(200).json({ success: true, reward: payoutResult });

  } catch (err) {
    console.error('❌ A2U error:', err);
    return res.status(500).json({ error: err.message || 'Unknown server error' });
  }
}
