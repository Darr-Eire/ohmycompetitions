'use client';

import React, { useState, useEffect } from 'react';
import { loadPiSdk } from 'lib/pi';

export default function BuyTicketButton({ competitionSlug, entryFee, quantity }) {
  const [sdkReady, setSdkReady] = useState(false);

  // Load Pi SDK on mount
  useEffect(() => {
    loadPiSdk(setSdkReady);
  }, []);

const handlePayment = async () => {
  try {
    // Your payment logic (e.g. Pi.createPayment) should be here, omitted for brevity

    // --- NEW: Update tickets sold in your competitions collection
    const updateRes = await fetch('/api/competitions/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: competitionSlug, quantity }),
    });

    if (!updateRes.ok) {
      throw new Error('Failed to update tickets sold');
    }

    const data = await updateRes.json();

    alert(`✅ Ticket purchased successfully!\n🎟️ ID: ${data.ticketId}`);
  } catch (err) {
    console.error('[ERROR] Completing payment:', err);
    alert('❌ Server completion failed. See console.');
  }
};


  return (
    <button
      onClick={handlePayment}
      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow transition"
    >
      Confirm Ticket Purchase
    </button>
  );
}
