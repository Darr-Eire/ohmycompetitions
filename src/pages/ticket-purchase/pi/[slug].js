'use client'

import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

const piCompetitions = {
  'pi-giveaway-10k': {
    title: '10,000 Pi Giveaway',
    prize: '10,000 π',
    entryFee: 2.2,
    date: 'June 28, 2025',
    time: '12:00 AM UTC',
    endsAt: '2025-06-30T00:00:00Z',
    location: 'Online',
    totalTickets: 5200,
  }, 
  'pi-giveaway-5k': {
    title: '5,000 Pi Giveaway',
    prize: '5,000 π',
    entryFee: 1.8,
    date: 'June 29, 2025',
    time: '12:00 AM UTC',
    endsAt: '2025-06-30T00:00:00Z',
    location: 'Online',
    totalTickets: 2900,
  },
  'pi-giveaway-2,500k': {
    title: '2,500 Pi Giveaway',
    prize: '2,500 π',
    entryFee: 1.6,
    date: 'June 28, 2025',
    time: '12:00 AM UTC',
    endsAt: '2025-06-29T00:00:00Z',
    location: 'Online',
    totalTickets: 1600,
  },
};

export default function PiTicketPage() {
  const router = useRouter()
  const { slug } = router.query
  const competition = piCompetitions[slug]

  const [quantity, setQuantity] = useState(1)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!competition) return
    const interval = setInterval(() => {
      const diff = new Date(competition.endsAt) - new Date()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 })
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        const minutes = Math.floor((diff / (1000 * 60)) % 60)
        setTimeLeft({ days, hours, minutes })
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [competition])

  const handlePayment = async () => {
    if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0) {
      alert('This competition has ended.')
      return
    }
    setProcessing(true)

    try {
      const total = competition.entryFee * quantity

      if (!window?.Pi?.createPayment) {
        alert("⚠️ Pi SDK not ready");
        setProcessing(false);
        return;
      }

      window.Pi.createPayment(
        {
          amount: total,
          memo: `Entry to ${competition.title}`,
          metadata: {
            type: 'pi-competition-entry',
            competitionSlug: slug,
            quantity,
          },
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            const res = await fetch('/api/payments/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
            if (!res.ok) throw new Error(await res.text());
            console.log('✅ Payment approved');
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            const res = await fetch('/api/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });
            if (!res.ok) throw new Error(await res.text());
            console.log('✅ Payment completed');
            alert("✅ Entry confirmed! Good luck!");
          },
          onCancel: () => {
            console.warn("Payment cancelled");
          },
          onError: (err) => {
            console.error("Payment error:", err);
            alert("Payment failed");
          },
        }
      );
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong during payment.");
    }
    setProcessing(false);
  };

  if (!slug) return null
  if (!competition) return <p style={{ color: '#fff' }}>Competition not found.</p>

  return (
    <div style={{ background: '#0a0e1a', minHeight: '100vh', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '500px', background: '#0d1424', border: '2px solid #00bfff', borderRadius: '20px', padding: '2rem', color: '#fff' }}>
        <h1 style={{ fontSize: '2rem', color: '#00bfff', marginBottom: '1rem' }}>{competition.title}</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Prize: {competition.prize}</p>
        <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>Entry Fee: {competition.entryFee} π</p>

        <div style={{ marginBottom: '1rem' }}>
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
          <span style={{ margin: '0 1rem' }}>{quantity}</span>
          <button onClick={() => setQuantity(q => q + 1)}>+</button>
        </div>

        <p style={{ marginBottom: '1rem' }}>Total: {(competition.entryFee * quantity).toFixed(2)} π</p>

        <button
          onClick={handlePayment}
          disabled={processing}
          style={{ background: '#00bfff', color: '#000', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 'bold' }}
        >
          {processing ? 'Processing...' : 'Pay with Pi'}
        </button>
      </div>
    </div>
  )
}
