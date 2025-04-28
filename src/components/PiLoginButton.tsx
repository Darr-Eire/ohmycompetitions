// src/components/PiLoginButton.tsx
import { useState } from 'react';
import type { PaymentData, PaymentCallbacks } from '@/types/pi-sdk';

export function PiLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setLoading(true);

    // 1) Ensure SDK is loaded
    if (typeof window.Pi?.init !== 'function') {
      setError('Pi SDK not available. Open in Pi Browser.');
      setLoading(false);
      return;
    }
    window.Pi.init({ version: '1.0.0', sandbox: true });

    // 2) Authenticate with the 'payments' scope
    if (typeof window.Pi.authenticate !== 'function') {
      setError('Pi.authenticate not available.');
      setLoading(false);
      return;
    }

    try {
      // For older SDKs, you may need:
      // await new Promise((res, rej) =>
      //   window.Pi.authenticate(['payments'], (err) => (err ? rej(err) : res(undefined)))
      // );
      await window.Pi.authenticate({ scopes: ['payments'] });
    } catch (err: any) {
      setError('Authorization failed: ' + (err.message || err));
      setLoading(false);
      return;
    }

    // 3) Now you can create the payment
    const paymentData: PaymentData = {
      amount: 1.23,
      memo: 'My purchase',
      metadata: { foo: 'bar' },
    };

    const callbacks: PaymentCallbacks = {
      onReadyForServerApproval(paymentId) {
        fetch('/api/pi/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
        });
      },
      onReadyForServerCompletion(paymentId, txid) {
        fetch('/api/pi/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, txid }),
        }).finally(() => setLoading(false));
      },
      onCancel(paymentId) {
        setError('Payment canceled.');
        setLoading(false);
      },
      onError(err) {
        setError(err.message ?? 'Unknown error');
        setLoading(false);
      },
    };

    window.Pi.createPayment(paymentData, callbacks);
  };

  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? 'Processing…' : 'Pay with Pi'}
      {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
    </button>
  );
}
