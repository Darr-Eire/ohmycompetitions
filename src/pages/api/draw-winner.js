await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/rewards/send`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 2.5,
    recipient_uid: winner.uid,
    metadata: {
      competitionSlug: winner.competitionSlug,
      type: 'auto_cron_reward',
    },
  }),
});
