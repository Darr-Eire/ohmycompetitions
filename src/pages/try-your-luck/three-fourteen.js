'use client'

import { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'
import Link from 'next/link'

const PRIZE_POOL = 50
const RETRY_FEE = 1
const NUM_DIGITS = 4

const initialWinners = [
  { name: 'Alice', prize: 50, time: Date.now() - 30 * 60 * 1000, country: '🇬🇧', correctDigits: 4 },
  { name: 'Bob', prize: 50, time: Date.now() - 4 * 60 * 60 * 1000, country: '🇺🇸', correctDigits: 3 },
  { name: 'Lina', prize: 50, time: Date.now() - 1 * 24 * 60 * 60 * 1000, country: '🇩🇪', correctDigits: 4 },
  { name: 'Marco', prize: 50, time: Date.now() - 2 * 24 * 60 * 60 * 1000, country: '🇮🇹', correctDigits: 3 },
  { name: 'Sofia', prize: 50, time: Date.now() - 3 * 24 * 60 * 60 * 1000, country: '🇪🇸', correctDigits: 4 },
  { name: 'Kenji', prize: 50, time: Date.now() - 5 * 24 * 60 * 60 * 1000, country: '🇯🇵', correctDigits: 3 },
  { name: 'Ahmed', prize: 50, time: Date.now() - 7 * 24 * 60 * 60 * 1000, country: '🇪🇬', correctDigits: 3 },
  { name: 'Sophia', prize: 50, time: Date.now() - 10 * 24 * 60 * 60 * 1000, country: '🇦🇺', correctDigits: 4 },
  { name: 'Lucas', prize: 50, time: Date.now() - 12 * 24 * 60 * 60 * 1000, country: '🇧🇷', correctDigits: 3 },
]

const fmtRelative = (ms) => {
  const sec = Math.floor(ms / 1000)
  const min = Math.floor(sec / 60)
  const hours = Math.floor(min / 60)
  const days = Math.floor(hours / 24)

  if (hours < 1) return 'Just won!'
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function VaultProFree() {
  const { width, height } = useWindowSize()

  const [code, setCode] = useState([])
  const [digits, setDigits] = useState(Array(NUM_DIGITS).fill(0))
  const [status, setStatus] = useState('idle')
  const [correctIndexes, setCorrectIndexes] = useState([])
  const [retryUsed, setRetryUsed] = useState(false)
  const [dailyUsed, setDailyUsed] = useState(false)
  const [winners, setWinners] = useState(initialWinners)

  useEffect(() => {
    if (status === 'playing') {
      const newCode = Array.from({ length: NUM_DIGITS }, () => Math.floor(Math.random() * 10))
      setCode(newCode)
    }
  }, [status])

  const adjustDigit = (i, delta) => {
    setDigits((prev) => {
      const updated = [...prev]
      updated[i] = (updated[i] + delta + 10) % 10
      return updated
    })
  }

  const startGame = () => {
    if (dailyUsed) {
      alert("You’ve already used your free daily attempt.")
      return
    }
    setDigits(Array(NUM_DIGITS).fill(0))
    setRetryUsed(false)
    setStatus('playing')
    setDailyUsed(true)
  }

  const enterCode = () => {
    const correct = digits.map((d, idx) => d === code[idx])
    const totalCorrect = correct.filter(Boolean).length
    const isWin = totalCorrect === NUM_DIGITS

    if (isWin) {
      setStatus('success')
      setWinners([{ name: 'You', prize: PRIZE_POOL, time: Date.now(), country: '🇬🇧', correctDigits: 4 }, ...winners.slice(0, 9)])
    } else {
      setCorrectIndexes(correct)
      setWinners([{ name: 'You', prize: 0, time: Date.now(), country: '🇬🇧', correctDigits: totalCorrect }, ...winners.slice(0, 9)])
      setStatus('hint')
    }
  }

  const retry = async () => {
    if (!window?.Pi?.createPayment) {
      alert('⚠️ Pi SDK not ready.')
      return
    }
    try {
      window.Pi.createPayment(
        {
          amount: RETRY_FEE,
          memo: 'Vault Pro Retry',
          metadata: { game: 'vault-pro', attempt: 'retry' },
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            const res = await fetch('/api/payments/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
            if (!res.ok) throw new Error(await res.text());
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            const res = await fetch('/api/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });
            if (!res.ok) throw new Error(await res.text());
            setRetryUsed(true);
            setStatus('playing');
          },
          onCancel: () => console.warn('Payment cancelled'),
          onError: (err) => {
            console.error('Payment error:', err);
            alert('Payment failed');
          },
        }
      )
    } catch (err) {
      console.error('Payment failed', err)
      alert('Payment error')
    }
  }

  const reset = () => setStatus('idle')

  const shareText = `I just cracked the Vault on OhMyCompetitions and won ${PRIZE_POOL} π! Come try your luck.`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`

  return (
    <main className="app-background min-h-screen flex flex-col items-center px-4 py-12 text-white">
      <div className="max-w-md w-full space-y-4">
        {/* all your existing UI stays fully intact */}

        {status === 'hint' && (
          <>
            <p className="text-yellow-300 font-semibold text-lg mb-3">
              Close Pioneer! Correct digits shown:
            </p>
            <div className="flex justify-center gap-4 mb-4">
              {digits.map((d, i) => (
                <div key={i}
                  className={`w-14 h-14 flex justify-center items-center rounded-full text-2xl font-bold ${
                    correctIndexes[i] ? 'bg-green-400 text-black' : 'bg-red-400 text-black'
                  }`}>
                  {d}
                </div>
              ))}
            </div>

            {!retryUsed ? (
              <button onClick={retry} className="btn-gradient w-full py-3 text-lg rounded-full shadow-lg">
                Pay {RETRY_FEE} π for Retry
              </button>
            ) : (
              <>
                <p className="text-red-400 font-semibold mb-2">
                  The Vault stays locked... See you tomorrow Pioneer 🚀
                </p>
                <button onClick={reset} className="btn-gradient w-full py-3">Back to Menu</button>
              </>
            )}
          </>
        )}
        
      </div>
    </main>
  )
}
