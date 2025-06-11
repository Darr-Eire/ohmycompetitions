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

  // 🔐 Step 1: Authenticate first to trigger the "Allow" prompt
  window.Pi.authenticate([], async (authResult) => {
    if (!authResult || !authResult.accessToken) {
      alert('❌ Pi authentication failed.');
      return;
    }

    console.log('🔓 Pi authenticated:', authResult);

    // ✅ Step 2: Now it's safe to trigger the payment
    window.Pi.createPayment({
      amount: 1,
      memo: "Test",
      metadata: {},
      onReadyForServerApproval: async (paymentId) => {
        console.log("✅ paymentId from SDK:", paymentId);

        await fetch('/api/pi/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
        });
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        console.log("🟢 Completing:", paymentId, txid);
        await fetch('/api/pi/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, txid }),
        });
      },
      onCancel: (paymentId) => {
        console.log("❌ Cancelled by user:", paymentId);
      },
      onError: (error, payment) => {
        console.error("❌ Payment error:", error, payment);
      },
    });
  });
};



  return (
    <button onClick={startPayment} disabled={!sdkReady} className="p-2 bg-purple-700 text-white rounded">
      Pay 1π
    </button>
  );
}
