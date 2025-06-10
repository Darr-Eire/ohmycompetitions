'use client'

import { useEffect, useState, useRef } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'
import Link from 'next/link'


const MAX_RETRIES_PER_DAY = 5
const RETRY_PRICE = 0.50
const MAIN_PRIZE = 50

export default function PiGame() {
  const { width, height } = useWindowSize()

  const [running, setRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [result, setResult] = useState('')
  const [winners, setWinners] = useState([])
  const [playedFreeToday, setPlayedFreeToday] = useState(false)
  const [retryBalance, setRetryBalance] = useState(0)
  const [retryPurchasesToday, setRetryPurchasesToday] = useState(0)
  const [sdkReady, setSdkReady] = useState(false)

  const intervalRef = useRef(null)

  useEffect(() => { loadPiSdk(setSdkReady) }, [])

  useEffect(() => {
    const todayKey = new Date().toDateString()
    if (localStorage.getItem('piGamePlayed') === todayKey) setPlayedFreeToday(true)
    setRetryBalance(parseInt(localStorage.getItem('piGameRetries') || 0))
    setRetryPurchasesToday(parseInt(localStorage.getItem('piGamePurchases') || 0))
  }, [])

  const savePlayedToday = () => {
    const todayKey = new Date().toDateString()
    localStorage.setItem('piGamePlayed', todayKey)
    setPlayedFreeToday(true)
  }

  const saveRetries = (balance) => {
    setRetryBalance(balance)
    localStorage.setItem('piGameRetries', balance)
  }

  const savePurchases = (count) => {
    setRetryPurchasesToday(count)
    localStorage.setItem('piGamePurchases', count)
  }

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setTime(prev => +(prev + 0.01).toFixed(2))
    }, 10)
    return () => clearInterval(intervalRef.current)
  }, [running])

  const stop = () => {
    clearInterval(intervalRef.current)
    setRunning(false)

    if (time.toFixed(2) === "3.14") {
      setResult(`🏆 Perfect! You won ${MAIN_PRIZE} π`)
      setWinners(prev => [{ prize: MAIN_PRIZE, time: Date.now() }, ...prev].slice(0, 10))
    } else {
      setResult('❌ Missed 3.14s, better luck next time!')
    }
  }

  const startFreeAttempt = () => {
    savePlayedToday()
    resetGame()
    setRunning(true)
  }

  const startRetryAttempt = () => {
    if (retryBalance > 0) {
      saveRetries(retryBalance - 1)
      resetGame()
      setRunning(true)
    } else {
      alert('No retries available. Purchase one.')
    }
  }

  const purchaseRetry = async () => {
    if (!sdkReady || typeof window === 'undefined' || !window.Pi || typeof window.Pi.createPayment !== 'function') {
      alert('⚠️ Pi SDK not ready.')
      return
    }
    if (retryPurchasesToday >= MAX_RETRIES_PER_DAY) {
      alert("Retry purchase limit reached for today.")
      return
    }
    try {
      window.Pi.createPayment(
        {
          amount: RETRY_PRICE,
          memo: `3.14 Game Retry Purchase`,
          metadata: {
            type: 'pi-3.14-retry',
            retryNo: retryPurchasesToday + 1
          }
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            const res = await fetch('/api/payments/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId })
            })
            if (!res.ok) throw new Error(await res.text())
          },

          onReadyForServerCompletion: async (paymentId, txid) => {
            const res = await fetch('/api/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid })
            })
            if (!res.ok) throw new Error(await res.text())

            saveRetries(retryBalance + 1)
            savePurchases(retryPurchasesToday + 1)
            alert('✅ Retry purchased successfully.')
          },

          onCancel: () => {
            alert('❌ Payment cancelled.')
          },

          onError: (err) => {
            console.error(err)
            alert('❌ Payment failed.')
          }
        }
      )
    } catch (err) {
      console.error('Pi Payment error:', err)
      alert('❌ Payment processing error.')
    }
  }

  const resetGame = () => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setTime(0)
    setResult('')
  }

  const fmtRelative = ms => {
    const sec = Math.floor(ms / 1000)
    if (sec < 60) return `${sec}s ago`
    const min = Math.floor(sec / 60)
    if (min < 60) return `${min}m ago`
    return `${Math.floor(min / 60)}h ago`
  }

  return (
    <main className="app-background min-h-screen p-4 text-white flex flex-col items-center">
      <div className="max-w-md w-full space-y-4">

        <h1 className="title-gradient text-center text-3xl mb-2">3.14 Challenge</h1>
        <p className="text-cyan-300 text-center mb-4">Prize: {MAIN_PRIZE} π</p>

        <div className="flex justify-center items-center py-4">
          <div className="text-6xl font-mono">{time.toFixed(2)}s</div>
        </div>

        <div className="flex flex-col gap-4 items-center">

          {!running && (
            <>
              {!playedFreeToday && (
                <button onClick={startFreeAttempt} className="btn-gradient py-3 px-6 text-lg rounded-full shadow-lg w-full">
                  Start Free Play
                </button>
              )}

              {playedFreeToday && retryBalance > 0 && (
                <button onClick={startRetryAttempt} className="btn-gradient py-3 px-6 text-lg rounded-full shadow-lg w-full">
                  Retry Match
                </button>
              )}

              {playedFreeToday && (
                <button
                  onClick={purchaseRetry}
                  disabled={retryPurchasesToday >= MAX_RETRIES_PER_DAY}
                  className="btn-gradient py-3 px-6 text-lg rounded-full shadow-lg w-full"
                >
                  Purchase Retry ({RETRY_PRICE} π)
                </button>
              )}
            </>
          )}

          {running && (
            <button onClick={stop} className="btn-gradient py-3 px-6 text-lg rounded-full shadow-lg w-full">
              Stop
            </button>
          )}
        </div>

        {result && <p className="text-lg font-bold text-center mt-3">{result}</p>}

        <div className="text-center text-sm mt-4">
          Retries: {retryBalance} / Purchases Today: {retryPurchasesToday} / {MAX_RETRIES_PER_DAY}
        </div>

        <div className="text-center">
          <Link href="/terms" className="text-sm text-cyan-300 underline mt-4 block">
            Terms & Conditions
          </Link>
        </div>

        <div className="bg-white bg-opacity-10 rounded-2xl shadow-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-4 text-cyan-300"> Recent Winners</h2>
          {winners.length === 0 ? (
            <p>No winners yet.</p>
          ) : (
            <ul className="space-y-3">
              {winners.map((entry, idx) => (
                <li key={idx} className="bg-white bg-opacity-10 rounded-xl py-3 px-4 flex justify-between items-center shadow">
                  <div className="text-left">
                    <p className="font-semibold text-white">You</p>
                    <p className="text-sm text-cyan-300">Won {entry.prize} π</p>
                  </div>
                  <div className="text-xs text-white opacity-70">
                    {fmtRelative(Date.now() - entry.time)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link href="/try-your-luck" className="text-sm text-cyan-300 underline text-center block mt-4">
          Back to Mini Games
        </Link>

        {result.includes('🏆') && <Confetti width={width} height={height} />}
      </div>
    </main>
  )
}
