'use client';

import { useState } from 'react';

export default function TicketPurchaseForm({ competition, onSuccess }) {
  const [quantity, setQuantity] = useState(1);

  const handlePay = async () => {
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: competition.entryFee * quantity,
          currency: competition.currency,
        }),
      });
      const { paymentUrl } = await res.json();
      window.location.href = paymentUrl;
      onSuccess();
    } catch (err) {
      console.error('Payment failed', err);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <p className="mb-4">Price per ticket: {competition.entryFee} {competition.currency}</p>
      <div className="mb-4">
        <label className="mr-2">Quantity:</label>
        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="border p-1 rounded"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>
      <button onClick={handlePay} className="px-4 py-2 bg-blue-600 text-white rounded">
        Pay {quantity * competition.entryFee} {competition.currency}
      </button>
    </div>
