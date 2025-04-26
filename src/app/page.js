// src/app/page.js
'use client';
import { useState, useEffect } from 'react';
import PiLoginButton from '../components/PiLoginButton';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState(1);

  useEffect(() => {
    fetch('/api/sessions').then(r => r.json()).then(data => setUser(data.user));
  }, []);

  const handlePay = async () => {
    const res = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, memo: 'Test transaction' }),
    });
    const { paymentUrl } = await res.json();
    window.location.href = paymentUrl;
  };

  return (
    <div className="container mx-auto p-6">
      {!user ? (
        <PiLoginButton />
      ) : (
        <div>
          <p>Logged in as: {user.publicAddress}</p>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <span>Amount:</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                className="border rounded p-1 w-24"
              />
            </label>
            <button
              onClick={handlePay}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Pay with Pi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
