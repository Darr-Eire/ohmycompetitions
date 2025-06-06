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
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  return `${Math.floor(min / 60)}h ago`
}

export default function VaultPro() {
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
    const isWin = correct.every(Boolean)

    if (isWin) {
      setStatus('success')
      setWinners([{ name: 'You', prize: PRIZE_POOL, time: Date.now(), country: '🇬🇧', correctDigits: 4 }, ...winners.slice(0, 9)])
    } else {
      setCorrectIndexes(correct)
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
            console.log('Retry paymentId:', paymentId)
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            console.log('Payment completed:', txid)
            setRetryUsed(true)
            setStatus('playing')
          },
          onCancel: () => console.warn('Payment cancelled'),
          onError: (err) => {
            console.error('Payment error:', err)
            alert('Payment failed')
          },
        }
      )
    } catch (err) {
      console.error('Payment failed', err)
      alert('Payment error')
    }
  }

  const reset = () => setStatus('idle')

  const shareText = `I just cracked the Vault and won ${PRIZE_POOL} π! Come try your luck.`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`

  return (
    <main className="app-background min-h-screen flex flex-col items-center px-4 py-12 text-white">
      <div className="max-w-md w-full space-y-4">

        <div className="text-center mb-2">
          <h1 className="title-gradient text-2xl font-bold text-white">Pi Vault</h1>
        </div>

        <p className="text-center text-white text-lg mb-2">
          Have you got what it takes, Pioneer? Crack the 4-digit vault and win <span className="text-cyan-300">{PRIZE_POOL} π</span> — One free daily chance!
        </p>

        <div className="bg-white bg-opacity-10 rounded-2xl shadow-lg p-6 text-center">

          {status === 'idle' && (
            <button onClick={startGame} disabled={dailyUsed}
              className={`w-full py-3 rounded-full text-lg font-semibold text-white ${dailyUsed ? 'bg-gray-500 cursor-not-allowed' : 'btn-gradient'}`}>
              Free Daily Attempt
            </button>
          )}

          {status === 'playing' && (
            <>
              <p className="text-yellow-300 font-semibold text-lg mb-4">Crack Code:</p>
              <div className="flex justify-center gap-4 mb-6">
                {digits.map((digit, i) => (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <button onClick={() => adjustDigit(i, 1)} className="btn-gradient w-10 h-10 rounded-full text-lg">▲</button>
                    <div className="text-3xl font-mono">{digit}</div>
                    <button onClick={() => adjustDigit(i, -1)} className="btn-gradient w-10 h-10 rounded-full text-lg">▼</button>
                  </div>
                ))}
              </div>
              <button onClick={enterCode} className="btn-gradient w-full py-3 text-lg rounded-full shadow-lg">Crack Code</button>
            </>
          )}

          {status === 'hint' && (
            <>
              <p className="text-yellow-300 font-semibold text-lg mb-3">Close Pioneer! Correct digits shown:</p>
              <div className="flex justify-center gap-4 mb-4">
                {digits.map((d, i) => (
                  <div key={i} className={`w-14 h-14 flex justify-center items-center rounded-full text-2xl font-bold ${correctIndexes[i] ? 'bg-green-400 text-black' : 'bg-red-400 text-black'}`}>
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
                  <p className="text-red-400 font-semibold mb-2">The Vault stays locked... See you tomorrow Pioneer 🚀</p>
                  <button onClick={reset} className="btn-gradient w-full py-3">Back to Menu</button>
                </>
              )}
            </>
          )}

          {status === 'success' && (
            <>
              <Confetti width={width} height={height} />
              <p className="text-green-400 font-bold text-xl mb-4">You cracked the Vault & won {PRIZE_POOL} π!</p>
              <div className="flex justify-center space-x-4 mb-4">
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="underline">Share on Twitter</a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline">Share on WhatsApp</a>
              </div>
              <button onClick={reset} className="btn-gradient w-full py-3">Play Again Tomorrow</button>
            </>
          )}

        </div>

        <div className="text-center mt-6">
          <Link href="/terms/vault-pro-plus" className="text-sm text-cyan-300 underline">Pi Vault Terms & Conditions</Link>
        </div>

        <Link href="/try-your-luck" className="text-sm text-cyan-300 underline block text-center mt-2">
          Back to Mini Games
        </Link>

      </div>
    </main>
  )
}
