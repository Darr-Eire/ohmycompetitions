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
    window.Pi.init({ version: '1.0.0' });

    // 2) Kick off a payment instead of authenticate
    const paymentData: PaymentData = {
      amount: 1.23,
      memo: 'My purchase',
      metadata: { foo: 'bar' },
    };

    const callbacks: PaymentCallbacks = {
      onReadyForServerApproval(paymentId) {
        console.log('Approve on server:', paymentId);
      },
      onReadyForServerCompletion(paymentId, txid) {
        console.log('Completed:', paymentId, txid);
      },
      onCancel(paymentId) {
        setError('Payment canceled.');
        setLoading(false);
      },
      onError(err) {
        setError(err.message);
        setLoading(false);
      },
    };

    if (typeof window.Pi.createPayment !== 'function') {
      setError('Pi.createPayment not available.');
      setLoading(false);
      return;
    }

    window.Pi.createPayment(paymentData, callbacks);
  };

  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? 'Loading…' : 'Pay with Pi'}
    </button>
  );
}
