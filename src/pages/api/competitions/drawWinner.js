export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Example placeholder logic for selecting winner (replace this)
    const winner = {
      uid: 'replace_with_real_uid', // You must provide a real UID
      competitionSlug: 'replace_with_real_slug', // e.g., 'nintendo-switch'
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

    return res.status(200).json({ success: true, payout: result });
  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ error: error.message });
  }
}
