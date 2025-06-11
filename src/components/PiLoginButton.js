'use client';
import { useEffect, useState } from 'react';

export default function PiPaymentButton() {
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const loadSdk = () => {
      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.onload = () => {
        window.Pi.init({ version: '2.0' });
        setSdkReady(true);
      };
      document.body.appendChild(script);
    };

    if (!window.Pi) loadSdk();
    else {
      window.Pi.init({ version: '2.0' });
      setSdkReady(true);
    }
  }, []);

  const startPayment = () => {
    if (!window.Pi) return alert('Pi SDK not loaded');

    window.Pi.createPayment({
      amount: 1,
      memo: 'Test payment',
      metadata: { purpose: 'demo' },
      onReadyForServerApproval: async (paymentId) => {
        console.log('🟡 Approving:', paymentId);
        await fetch('/api/pi/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
        });
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        console.log('🟢 Completing:', paymentId, txid);
        await fetch('/api/pi/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, txid }),
        });
      },
      onCancel: (paymentId) => {
        console.log('❌ Cancelled by user:', paymentId);
      },
      onError: (error, payment) => {
        console.error('❌ Payment error:', error, payment);
      },
    });
  };

  return (
    <button onClick={startPayment} disabled={!sdkReady} className="p-2 bg-purple-700 text-white rounded">
      Pay 1π
    </button>
  );
}
