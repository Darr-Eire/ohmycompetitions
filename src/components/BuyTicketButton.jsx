'use client';

import { useState } from 'react';
import { initiatePiPayment } from '../utils/initiatePiPayment';
import { usePiAuth } from '../context/PiAuthContext';

export default function BuyTicketButton({ competitionSlug, entryFee, quantity }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { user, login, sdkReady } = usePiAuth();

  const handleBuy = async () => {
    setLoading(true);

    try {
  
   if (!user) {
  alert('❌ Please log in with Pi to continue.');
  await login(); 
  return;
}

      
        const storedUser = localStorage.getItem('piUser');
        if (!storedUser) throw new Error('Login failed or cancelled.');
      }

      const currentUser = JSON.parse(localStorage.getItem('piUser'));
      const uid = currentUser.uid || currentUser.username;
      const memo = `Entry to ${competitionSlug}`;
      const total = entryFee * quantity;

      const paymentResult = await initiatePiPayment(total, memo, uid);
      setResult(paymentResult);

      alert(`✅ Payment Complete!\nTX: ${paymentResult.txid}`);
    } catch (err) {
      console.error('❌ Payment/Login failed:', err);
      alert(`❌ ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      disabled={loading}
      onClick={handleBuy}
      className="w-full bg-gradient-to-r from-green-400 to-blue-600 text-black font-bold py-3 px-4 rounded-xl mt-4 disabled:opacity-50"
    >
      {loading
        ? 'Processing...'
        : user
        ? `Pay & Enter (${(entryFee * quantity).toFixed(2)} π)`
        : 'Login with Pi to Continue'}
    </button>
  );
}
