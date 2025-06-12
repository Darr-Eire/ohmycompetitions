'use client';

import { usePiAuth } from 'context/PiAuthContext';

export default function BuyWithPiButton({ amount, competitionSlug }) {
  const { user } = usePiAuth();

  const handlePayment = async () => {
    if (!window.Pi || !user) {
      alert('Please log in with Pi first.');
      return;
    }

    window.Pi.createPayment(
      {
        amount,
        memo: `Entry for ${competitionSlug}`,
        metadata: { competitionSlug },
      },
      {
        onReadyForServerApproval: async (paymentId) => {
          await fetch('/api/pi/approve-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, uid: user.uid, competitionSlug, amount }),
          });
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          await fetch('/api/pi/complete-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid }),
          });

          alert('✅ Payment successful! 🎉');
        },
        onCancel: () => {
          alert('❌ Payment cancelled');
        },
        onError: (error) => {
          console.error('Payment error:', error);
          alert('❌ Payment failed');
        },
      }
    );
  };

  return (
    <button
      onClick={handlePayment}
      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-bold"
    >
      Pay {amount} π to Enter
    </button>
  );
}
