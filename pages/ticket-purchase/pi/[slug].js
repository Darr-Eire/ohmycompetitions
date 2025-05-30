'use client'

import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

const piCompetitions = {
  'pi-giveaway-10k': {
    title: '10,000 Pi Giveaway',
    prize: '10,000 π',
    entryFee: 10,
    date: 'May 20, 2025',
    time: '12:00 AM UTC',
    endsAt: '2025-05-20T00:00:00Z',
    location: 'Online',
  },
  'pi-giveaway-5k': {
    title: '5,000 Pi Giveaway',
    prize: '5,000 π',
    entryFee: 5,
    date: 'May 11, 2025',
    time: '12:00 AM UTC',
    endsAt: '2025-05-11T00:00:00Z',
    location: 'Online',
  },
  'pi-giveaway-2,500k': {
    title: '2,500 Pi Giveaway',
    prize: '2,500 π',
    entryFee: 2,
    date: 'May 11, 2025',
    time: '12:00 AM UTC',
    endsAt: '2025-05-11T00:00:00Z',
    location: 'Online',
  },
};

export default function PiTicketPage() {
  const router = useRouter()
  const { slug } = router.query
  const competition = piCompetitions[slug]
  const [quantity, setQuantity] = useState(1)
  const [timeLeft, setTimeLeft] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!competition) return
    const interval = setInterval(() => {
      const diff = new Date(competition.endsAt) - new Date()
      if (diff <= 0) {
        setTimeLeft('Ended')
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff / (1000 * 60)) % 60)
        setTimeLeft(`${hours}h ${minutes}m`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [competition])

  const handlePayment = async () => {
    if (timeLeft === 'Ended') return alert('This competition has ended.')
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

        // Optional: POST to your backend
        // await fetch('/api/entries', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     txid: payment.transaction.txid,
        //     competitionSlug: slug,
        //     quantity,
        //   }),
        // })

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
  padding: '0rem 1rem 4rem',
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
        padding: '2rem',
        color: '#fff',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '1.75rem',
          color: '#00bfff',
          marginBottom: '1rem',
        }}>
          {competition.title}
        </h1>

        <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}><strong>Prize:</strong> {competition.prize}</p>

        <div style={{
          background: '#001f33',
          borderRadius: '8px',
          padding: '0.5rem 1rem',
          display: 'inline-block',
          marginBottom: '1rem',
          color: timeLeft === 'Ended' ? '#f66' : '#0f0',
        }}>
          ⏳ Ends In: <strong>{timeLeft}</strong>
        </div>

        <p><strong>Date:</strong> {competition.date}</p>
        <p><strong>Time:</strong> {competition.time}</p>
        <p><strong>Location:</strong> {competition.location}</p>
        <p><strong>Entry Fee:</strong> {competition.entryFee} π</p>
        <p><strong>Price per ticket:</strong> {competition.entryFee} π</p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '1rem',
        }}>
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={qtyBtnStyle}>–</button>
          <span style={{ fontSize: '1.2rem' }}>{quantity}</span>
          <button onClick={() => setQuantity(q => q + 1)} style={qtyBtnStyle}>+</button>
        </div>

        <p style={{ marginTop: '1rem' }}>
          <strong>Total:</strong> {(competition.entryFee * quantity).toFixed(2)} π
        </p>

        <p style={{
          marginTop: '1rem',
          color: '#aaa',
          fontSize: '0.95rem',
        }}>
          Secure your entry to win <strong>{competition.prize}</strong> — don’t miss out!
        </p>

        <button
          style={payBtnStyle}
          onClick={handlePayment}
          disabled={processing}
        >
          {processing ? 'Processing...' : 'Pay with Pi to Enter'}
        </button>
      </div>
    </div>
  )
}
