// Assume you already have: const winner = { uid: 'xxx', competitionSlug: 'abc' }

try {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/rewards/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: 1.5, // or whatever prize amount
      recipient_uid: winner.uid,
      metadata: {
        competitionSlug: winner.competitionSlug,
        type: 'auto_reward',
      },
    }),
  });

  const result = await res.json();
  if (!res.ok) {
    console.error('❌ Failed to send Pi to winner:', result.error);
  } else {
    console.log('✅ Pi reward sent:', result);
  }
} catch (err) {
  console.error('❌ A2U error:', err);
}
