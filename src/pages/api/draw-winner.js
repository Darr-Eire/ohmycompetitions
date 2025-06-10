export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // TODO: Replace with actual winner selection logic from your DB
    const winner = {
      uid: 'pi_uid_here', // replace this with actual Pi user UID
      competitionSlug: 'nintendo-switch', // replace with real slug
    };

    const response = await fetch(
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
            type: 'auto_draw_reward',
          },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to send Pi:', result.error);
      return res.status(500).json({ error: result.error });
    }

    return res.status(200).json({ success: true, reward: result });
  } catch (error) {
    console.error('❌ draw-winner.js error:', error);
    return res.status(500).json({ error: error.message });
  }
}
