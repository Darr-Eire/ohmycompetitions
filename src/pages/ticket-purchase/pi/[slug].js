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
 const [ticketsSold, setTicketsSold] = useState(750);
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

  // ** THIS FUNCTION MUST BE async **
  const handlePayment = async () => {
    if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0) {
      alert('This competition has ended.')
      return
    }
    setProcessing(true)

    try {
      const total = competition.entryFee * quantity

      const payment = await window.Pi.createPayment({
        amount: total,
        memo: `Entry to ${competition.title}`,
        metadata: {
          type: 'pi-entry',
          competitionSlug: slug,
          quantity,
        },
      })

      if (payment?.transaction?.txid) {
        alert('✅ Entry confirmed! Good luck!')
      } else {
        alert('❌ Payment cancelled or failed.')
      }
    } catch (err) {
      console.error(err)
      alert('❌ Something went wrong during payment.')
    }

    setProcessing(false)
  }

  if (!slug) return null
  if (!competition) return <p style={{ color: '#fff' }}>Competition not found.</p>

  const qtyBtnStyle = {
    background: '#00bfff',
    color: '#000',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '6px',
    width: '32px',
    height: '32px',
    fontSize: '1.2rem',
    cursor: 'pointer',
  }

  const payBtnStyle = {
    background: 'linear-gradient(to right, #00bfff, #1aefff)',
    color: '#000',
    fontWeight: 'bold',
    fontSize: '1rem',
    padding: '0.75rem 1.5rem',
    marginTop: '1.5rem',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    opacity: processing ? 0.7 : 1,
  }

  return (
    <div style={{
      background: '#0a0e1a',
      minHeight: '100vh',
      padding: '2rem 1rem 4rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: '#0d1424',
        border: '2px solid #00bfff',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        color: '#fff',
        textAlign: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        boxShadow: '0 0 15px rgba(0, 191, 255, 0.4)',
      }}>
        {/* Title */}
        <h1 style={{
          fontSize: '2rem',
          color: '#00bfff',
          marginBottom: '1.25rem',
          fontWeight: '700',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          {competition.title}
        </h1>

        {/* Prize */}
        <p style={{
          fontSize: '1.2rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          color: '#cce7ff',
        }}>
          Prize: <span style={{ fontWeight: '700', color: '#ffffff' }}>{competition.prize}</span>
        </p>

        {/* Countdown */}
        <div style={{
          background: '#001f33',
          borderRadius: '10px',
          padding: '0.75rem 1.25rem',
          display: 'inline-block',
          marginBottom: '2rem',
          color: (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0) ? '#ff6b6b' : '#32cd32',
          fontWeight: '700',
          fontSize: '1rem',
          letterSpacing: '0.03em',
          minWidth: '160px',
        }}>
       <strong>{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m</strong>
        </div>

        {/* Entry Fee and Price */}
        <div style={{
          fontSize: '1.05rem',
          fontWeight: '600',
          color: '#d1e9ff',
          marginBottom: '1.5rem',
          letterSpacing: '0.02em',
        }}>
          <p>Entry Fee: <span style={{ fontWeight: '700', color: '#ffffff' }}>{competition.entryFee} π</span></p>
          <p>Price per ticket: <span style={{ fontWeight: '700', color: '#ffffff' }}>{competition.entryFee} π</span></p>
        </div>

        {/* Quantity selector */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.8rem',
        }}>
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={qtyBtnStyle}>–</button>
          <span style={{ fontSize: '1.4rem', fontWeight: '700', minWidth: '30px' }}>{quantity}</span>
          <button onClick={() => setQuantity(q => q + 1)} style={qtyBtnStyle}>+</button>
        </div>

        {/* Total Tickets Available */}
        {typeof competition.totalTickets === 'number' && (
          <p style={{
            marginBottom: '1.8rem',
            fontWeight: '700',
            color: '#00bfff',
            fontSize: '1.1rem',
            letterSpacing: '0.03em',
          }}>
            Total Tickets Available: {competition.totalTickets}
          </p>
        )}

        {/* Total Price */}
        <p style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          marginBottom: '1.2rem',
          color: '#ffffff',
          letterSpacing: '0.04em',
        }}>
          Total: {(competition.entryFee * quantity).toFixed(2)} π
        </p>

        {/* Secure your entry message */}
        <p style={{
          marginBottom: '1.8rem',
          color: '#a1a9c1',
          fontSize: '0.95rem',
          lineHeight: '1.4',
          letterSpacing: '0.02em',
          fontStyle: 'italic',
        }}>
          Secure your entry to win <strong>{competition.prize}</strong> — don’t miss out!
        </p>

        {/* Pay button */}
        <button
          style={{
            background: 'linear-gradient(to right, #00bfff, #1aefff)',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '1rem',
            padding: '0.75rem 1.5rem',
            marginTop: '1.5rem',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            opacity: processing ? 0.7 : 1,
          }}
          onClick={handlePayment}
          disabled={processing}
        >
          {processing ? 'Processing...' : 'Pay with Pi to Enter'}
        </button>
      </div>
    </div>
  )
}
