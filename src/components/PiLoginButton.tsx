// src/components/PiLoginButton.tsx
import { useState } from 'react';
import type { PaymentData, PaymentCallbacks } from '@/types/pi-sdk';

export function PiLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    setLoading(true);

    // 1) Ensure SDK loaded & initialized
    if (typeof window.Pi?.init !== 'function') {
      setError('Pi SDK not available. Open in Pi Browser.');
      setLoading(false);
      return;
    }
    window.Pi.init({ version: '1.0.0', sandbox: false });

    // 2) Prepare payment data
    const paymentData: PaymentData = {
      amount: 1.23,
      memo: 'My purchase',
      metadata: { foo: 'bar' },
    };

    // 3) Define lifecycle callbacks
    const callbacks: PaymentCallbacks = {
      onReadyForServerApproval(paymentId) {
        // Call your backend to approve the payment
        fetch('/api/pi/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
        });
      },
      onReadyForServerCompletion(paymentId, txid) {
        // Call your backend to complete the payment
        fetch('/api/pi/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, txid }),
        }).finally(() => {
          setLoading(false);
        });
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

    // 4) Kick off the payment
    if (typeof window.Pi.createPayment !== 'function') {
      setError('Pi.createPayment not available.');
      setLoading(false);
      return;
    }

    window.Pi.createPayment(paymentData, callbacks);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
    >
      {loading ? 'Processing…' : 'Pay with Pi'}
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </button>
  );
}
