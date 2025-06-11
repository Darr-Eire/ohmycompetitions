const handlePayment = async () => {
  if (!sdkReady || typeof window === 'undefined' || !window.Pi) {
    alert('⚠️ Pi SDK not ready. Use Pi Browser.');
    return;
  }

  // 🔐 Force Pi authentication before payment
  window.Pi.authenticate([], async (authResult) => {
    if (!authResult || !authResult.accessToken) {
      alert('❌ Pi authentication failed.');
      return;
    }

    console.log('🔓 Pi authenticated:', authResult);

    const total = (entryFee * quantity).toFixed(2);

    window.Pi.createPayment(
      {
        amount: parseFloat(total),
        memo: `Entry for ${competitionSlug}`,
        metadata: { competitionSlug, quantity },
      },
      {
        onReadyForServerApproval: async (paymentId) => {
          try {
            const res = await fetch('/api/payments/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId,
                uid: piUser?.uid,
                competitionSlug,
                amount: parseFloat(total),
              }),
            });

            if (!res.ok) throw new Error(await res.text());
            console.log('[✅] Payment approved');
          } catch (err) {
            console.error('[❌] Approving payment:', err);
            alert('❌ Approval failed. See console.');
          }
        },

        onReadyForServerCompletion: async (paymentId, txid) => {
          try {
            const res = await fetch('/api/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });

            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();
            alert(`✅ Ticket purchased!\n🎟️ ID: ${data.ticketId}`);
          } catch (err) {
            console.error('[❌] Completing payment:', err);
            alert('❌ Completion failed. See console.');
          }
        },

        onCancel: (paymentId) => {
          console.warn('[⛔] Payment cancelled:', paymentId);
        },

        onError: (error, payment) => {
          console.error('[❌] Payment error:', error, payment);
          alert('❌ Payment failed. See console.');
        },
      }
    );
  });
};
