// /src/pages/api/draw-winner.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // This is where you'd query your DB to get the actual winner
    const winner = {
      uid: 'REPLACE_WITH_REAL_UID', // Replace with real user Pi UID
      competitionSlug: 'REPLACE_WITH_SLUG', // Replace with actual comp slug
    };

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
            type: 'auto_draw_reward',
          },
        }),
      }
    );

    const payoutResult = await payoutRes.json();

    if (!payoutRes.ok) {
      console.error('❌ Failed to send Pi:', payoutResult.error);
      return res.status(500).json({ error: payoutResult.error });
    }

    return res.status(200).json({ success: true, reward: payoutResult });
  } catch (err) {
    console.error('❌ Error in draw-winner:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
