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

  const retry = () => {
    setRetryUsed(true)
    setStatus('playing')
  }

  const reset = () => {
    setStatus('idle')
  }

  const shareText = `I just cracked the Vault on OhMyCompetitions and won ${PRIZE_POOL} π! Come try your luck.`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`

  return (
    <main className="app-background min-h-screen flex flex-col items-center px-4 py-12 text-white">
      <div className="max-w-md w-full space-y-4">

        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="title-gradient text-2xl font-bold text-white">Pi Vault</h1>
        </div>

        <p className="text-center text-white text-lg mb-2">
          🔐 Have you got what it takes, Pioneer? <br />
          Crack the secret <span className="text-white">4-digit vault</span> and win 
          <span className="text-cyan-300"> {PRIZE_POOL} π</span><br />
          One free daily chance — one shot at crypto glory 🚀
        </p>

        <div className="bg-white bg-opacity-10 rounded-2xl shadow-lg p-6 text-center">
          {status === 'idle' && (
            <button onClick={startGame} disabled={dailyUsed}
              className={`w-full py-3 rounded-full text-lg font-semibold text-white ${
                dailyUsed ? 'bg-gray-500 cursor-not-allowed' : 'btn-gradient'
              }`}>
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
              <button onClick={enterCode} className="btn-gradient w-full py-3 text-lg rounded-full shadow-lg">
                Crack Code
              </button>
            </>
          )}

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

          {status === 'success' && (
            <>
              <Confetti width={width} height={height} />
              <p className="text-green-400 font-bold text-xl mb-4">
                🎉 You cracked the Vault & won {PRIZE_POOL} π!
              </p>
              <div className="flex justify-center space-x-4 mb-4">
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  Share on Twitter
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  Share on WhatsApp
                </a>
              </div>
              <button onClick={reset} className="btn-gradient w-full py-3">Play Again Tomorrow</button>
            </>
          )}
        </div>

        {/* Recent Winners */}
        <div className="bg-white bg-opacity-10 rounded-2xl shadow-lg p-6 text-center overflow-hidden">
          <h2 className="title-gradient text-2xl font-bold mb-4">Recent Vault Winners</h2>
          {winners.filter(e => e.correctDigits === 4).length === 0 ? (
            <p className="text-white text-sm mb-2">No winners yet. The vault remains sealed...</p>
          ) : (
            winners.filter(e => e.correctDigits === 4).map((entry, i) => (
              <div key={i} className="text-sm text-white flex justify-center items-center space-x-2">
                <span>🏆 {entry.country} {entry.name}</span>
                <span>won {entry.prize} π</span>
                <span>· {fmtRelative(Date.now() - entry.time)}</span>
              </div>
            ))
          )}
        </div>

        {/* Close Attempts */}
        <div className="bg-white bg-opacity-10 rounded-2xl shadow-lg p-6 text-center overflow-hidden">
          <h2 className="title-gradient text-2xl font-bold mb-4">Close Pioneer Attempts</h2>
          {winners.filter(e => e.correctDigits < 4).length === 0 ? (
            <p className="text-white text-sm mb-2">No close attempts yet.</p>
          ) : (
            winners.filter(e => e.correctDigits < 4).map((entry, i) => (
              <div key={i} className="text-sm text-white flex justify-center items-center space-x-2">
                <span>⚠️ {entry.country} {entry.name}</span>
                <span>Hit {entry.correctDigits}/4</span>
                <span>· {fmtRelative(Date.now() - entry.time)}</span>
              </div>
            ))
          )}
        </div>

        {/* T&Cs Link */}
        <div className="text-center">
          <Link href="/terms/vault-pro-plus" className="text-sm text-cyan-300 underline my-4 block">
            Pi Vault Terms & Conditions
          </Link>
        </div>

        {/* Back Button */}
        <Link href="/try-your-luck" className="text-sm text-cyan-300 underline mt-2 mx-auto block text-center">
          Back to Mini Games
        </Link>
      </div>
    </main>
  )
}
