'use client'

import { useEffect, useState, useRef } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'
import Link from 'next/link'
import Head from 'next/head'
import { usePiAuth } from '../../context/PiAuthContext'

const PI_DIGITS = ['3', '1', '4', '1', '5', '9', '2', '6']
const DIGIT_SPEEDS = [1000, 900, 800, 600, 400, 300, 200, 150]
const MAX_RETRIES = 5
const RETRY_PRICE = 1
const BASE_PRIZE = 50
const JACKPOT_CHANCE = 314

const SKILL_QUESTION = 'What is 6 + 3?'
const SKILL_ANSWER = '9'

export default function MatchPiGame() {
  const { width, height } = useWindowSize()
  const { user, loginWithPi } = usePiAuth()
  const intervalRef = useRef(null)
  const countdownIntervalRef = useRef(null)
  const todayKey = new Date().toDateString()
  const yesterdayKey = new Date(Date.now() - 86400000).toDateString()

  const [digitIndex, setDigitIndex] = useState(0)
  const [currentDigit, setCurrentDigit] = useState('0')
  const [scrolling, setScrolling] = useState(false)
  const [result, setResult] = useState('')
  const [retries, setRetries] = useState(0)
  const [progress, setProgress] = useState([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [isJackpot, setIsJackpot] = useState(false)
  const [perfectFrame, setPerfectFrame] = useState(true)
  const [closestTry, setClosestTry] = useState(0)
  const [yesterdayStats, setYesterdayStats] = useState(null)
  const [freePlayedToday, setFreePlayedToday] = useState(false)
  const [winStreak, setWinStreak] = useState(0)
  const [nextFreeCountdown, setNextFreeCountdown] = useState('')
  const [skillAnswer, setSkillAnswer] = useState('')
  const [payoutStatus, setPayoutStatus] = useState('')
  const [sendingPayout, setSendingPayout] = useState(false)
const [skillConfirmed, setSkillConfirmed] = useState(false);

  useEffect(() => {
    const roll = Math.floor(Math.random() * JACKPOT_CHANCE)
    if (roll === 0) setIsJackpot(true)

    const storedClosest = parseInt(localStorage.getItem('piClosestTry') || '0')
    setClosestTry(storedClosest)

    const storedYesterday = localStorage.getItem('piStats-' + yesterdayKey)
    if (storedYesterday) setYesterdayStats(JSON.parse(storedYesterday))

    const hasPlayedFree = localStorage.getItem(`piFreePlayed-${todayKey}`) === 'true'
    setFreePlayedToday(hasPlayedFree)

    const streak = parseInt(localStorage.getItem('piWinStreak') || '0')
    setWinStreak(streak)

    startCountdown()

    return () => clearInterval(countdownIntervalRef.current)
  }, [])

  useEffect(() => {
    if (scrolling) {
      intervalRef.current = setInterval(() => {
        const target = parseInt(PI_DIGITS[digitIndex])
        const chanceOfTarget = Math.max(0.6 - digitIndex * 0.08, 0.1)
        const showTarget = Math.random() < chanceOfTarget
        const next = showTarget ? target.toString() : Math.floor(Math.random() * 10).toString()
        setCurrentDigit(next)
      }, DIGIT_SPEEDS[digitIndex])
    }
    return () => clearInterval(intervalRef.current)
  }, [scrolling, digitIndex])

  const startCountdown = () => {
    const next = new Date()
    next.setUTCHours(24, 0, 0, 0)
    const update = () => {
      const now = new Date()
      const diff = next - now
      const hrs = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0')
      const mins = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0')
      setNextFreeCountdown(`${hrs}h ${mins}m`)
    }
    update()
    countdownIntervalRef.current = setInterval(update, 1000)
  }

  const isDigitClose = (target, actual) => parseInt(target) === parseInt(actual)

  const handleStop = () => {
    clearInterval(intervalRef.current)
    const target = PI_DIGITS[digitIndex]
    const correct = isDigitClose(target, currentDigit)
    const updatedProgress = [...progress, { digit: target, hit: currentDigit, success: correct }]
    setProgress(updatedProgress)

    if (!correct) {
      setPerfectFrame(false)
      setScrolling(false)
      setResult(`❌ Missed digit ${target}. Try again.`)
      saveSessionStats(digitIndex, false)
      updateClosestTry(digitIndex)
      localStorage.setItem('piWinStreak', '0')
      return
    }

    if (digitIndex === PI_DIGITS.length - 1) {
      const reward = isJackpot ? BASE_PRIZE * 2 : BASE_PRIZE
      const bonus = perfectFrame ? ' 🎯 Perfect Timing Bonus +2π' : ''
      setShowConfetti(true)
      setResult(`🏆 You matched π! You win ${reward}π.${bonus}`)
      setScrolling(false)
      saveSessionStats(PI_DIGITS.length, true)
      updateClosestTry(PI_DIGITS.length)
      const streak = parseInt(localStorage.getItem('piWinStreak') || '0') + 1
      setWinStreak(streak)
      localStorage.setItem('piWinStreak', streak.toString())
      
      // Send Pi payout
      sendPiPayout(reward, bonus !== '')
    } else {
      setDigitIndex(digitIndex + 1)
    }
  }

  const sendPiPayout = async (finalPrize, hasPerfectTiming) => {
    if (!user) {
      setPayoutStatus('❌ User not logged in')
      return
    }

    setSendingPayout(true)
    setPayoutStatus('💰 Sending Pi payout...')

    try {
      const response = await fetch('/api/try-your-luck/match-pi-win', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userUid: user.uid,
          username: user.username,
          prizeAmount: BASE_PRIZE,
          isJackpot,
          perfectTiming: hasPerfectTiming
        })
      })

      const result = await response.json()

      if (result.success) {
        setPayoutStatus(`✅ ${result.message}`)
        console.log('🎉 Pi payout successful:', result)
      } else {
        setPayoutStatus(`❌ ${result.error || 'Payout failed'}`)
        console.error('❌ Pi payout failed:', result)
      }
    } catch (error) {
      console.error('❌ Payout API error:', error)
      setPayoutStatus('❌ Failed to send payout. Please contact support.')
    } finally {
      setSendingPayout(false)
    }
  }

  const canRetry = retries < MAX_RETRIES
  const skillAnswerIsCorrect = skillAnswer.trim() === SKILL_ANSWER

  const startFreeTry = () => {
    if (!skillAnswerIsCorrect) {
      alert('Answer the skill question correctly before starting.')
      return
    }
    
    if (!user) {
      alert('Please login with Pi to play Match Pi Code!')
      loginWithPi()
      return
    }
    
    localStorage.setItem(`piFreePlayed-${todayKey}`, 'true')
    setFreePlayedToday(true)
    beginNewAttempt()
  }

  const beginNewAttempt = () => {
    setScrolling(true)
    setCurrentDigit(Math.floor(Math.random() * 10).toString())
    setResult('')
    setDigitIndex(0)
    setProgress([])
    setPerfectFrame(true)
    setShowConfetti(false)
    setSkillAnswer('') // reset skill question on attempt start
    setPayoutStatus('')
  }

  const retry = async () => {
    if (!skillAnswerIsCorrect) {
      alert('Answer the skill question correctly before retrying.');
      return;
    }
    if (!canRetry) {
      alert(`Max retries reached (${MAX_RETRIES}).`);
      return;
    }

    // Handle incomplete Pi payments before starting a new one
    if (typeof window !== 'undefined' && window.Pi && typeof window.Pi.getIncompletePayment === 'function') {
      try {
        const incompletePayment = await window.Pi.getIncompletePayment();
        if (incompletePayment) {
          if (incompletePayment.transaction && incompletePayment.transaction.txid) {
            // Try to complete the incomplete payment
            await fetch('/api/pi/complete-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: incompletePayment.identifier,
                txid: incompletePayment.transaction.txid,
                slug: 'match-pi-retry',
                amount: RETRY_PRICE
              }),
            });
            alert('Previous pending payment was found and processed. Please try again.');
            return;
          } else {
            alert('You have a pending payment that cannot be completed automatically. Please open your Pi wallet and cancel the payment, then try again.');
            return;
          }
        }
      } catch (err) {
        alert('Error handling previous pending payment. Please try again later.');
        return;
      }
    }

    // Pi payment logic for retry (1π)
    if (typeof window === 'undefined' || !window.Pi || typeof window.Pi.createPayment !== 'function') {
      alert('⚠️ Pi SDK not ready.');
      return;
    }

    window.Pi.createPayment(
      {
        amount: RETRY_PRICE,
        memo: 'Retry Match Pi Code',
        metadata: { type: 'match-pi-retry', userId: user?.uid, username: user?.username },
      },
      {
        onReadyForServerApproval: async (paymentId) => {
          try {
            const res = await fetch('/api/pi/approve-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId,
                slug: 'match-pi-retry',
                amount: RETRY_PRICE
              }),
            });
            if (!res.ok) throw new Error(await res.text());
            console.log('✅ Payment approved');
          } catch (err) {
            alert('❌ Server approval failed.');
            throw err; // Prevents payment from proceeding
          }
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          try {
            const res = await fetch('/api/pi/complete-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId,
                txid,
                slug: 'match-pi-retry',
                amount: RETRY_PRICE
              }),
            });
            const result = await res.json();
            if (res.ok || (result?.message && result.message.toLowerCase().includes('completed'))) {
              setRetries(r => r + 1);
              beginNewAttempt();
              alert('✅ Payment successful! You can retry now.');
            } else {
              alert(result?.error || '❌ Server completion failed.');
            }
          } catch (err) {
            alert('❌ Server completion failed.');
          }
        },
        onCancel: () => {
          alert('Payment cancelled');
        },
        onError: (error) => {
          alert('Payment failed');
        },
      }
    );
  }

  const updateClosestTry = (depth) => {
    const stored = parseInt(localStorage.getItem('piClosestTry') || '0')
    if (depth > stored) {
      localStorage.setItem('piClosestTry', depth.toString())
      setClosestTry(depth)
    }
  }

  const saveSessionStats = (depth, success) => {
    const currentStats = JSON.parse(localStorage.getItem('piStats-' + todayKey) || '{}')
    const key = retries === 0 ? 'free' : `paid${retries}`
    currentStats[key] = { depth, success }
    localStorage.setItem('piStats-' + todayKey, JSON.stringify(currentStats))
  }

  const shareScore = () => {
    const msg = `I matched ${closestTry}/${PI_DIGITS.length} digits in the π Challenge on @OhMyCompetitions 🔥 Try it: https://ohmycompetitions.vercel.app/try-your-luck/three-fourteen`
    navigator.clipboard.writeText(msg)
    alert('Score copied to clipboard! Share it on social media!')
  }

  return (
    <>
      <Head>
        <title>Match The Pi Code - Oh My Competitions</title>
      </Head>
      <main className="min-h-screen px-4 py-12 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-orbitron flex flex-col items-center text-center">
        <div className="max-w-md w-full space-y-4 border border-cyan-700 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_#00fff055]">

          <div className="mb-2">
            <h1 className="bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 border border-cyan-700 shadow-[0_0_30px_#00fff055] w-full max-w-md px-4 py-3 rounded-3xl text-cyan-300">
              Match The Pi Code
            </h1>
          </div>

          {/* User Status */}
          {!user && (
            <div className="bg-red-800 bg-opacity-30 border border-red-400 p-3 rounded-xl text-center">
              <p className="text-red-300 mb-2">🔐 Login Required</p>
              <button
                onClick={loginWithPi}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded font-bold"
              >
                Login with Pi
              </button>
            </div>
          )}


          {winStreak >= 3 && (
            <div className="bg-cyan-800 bg-opacity-30 border border-cyan-400 p-3 rounded-xl">
              🌟 You're on a {winStreak}-day win streak! Bonus activated!
            </div>
          )}

          {/* Payout Status */}
          {payoutStatus && (
            <div className={`p-3 rounded-lg mb-4 ${
              payoutStatus.includes('✅') ? 'bg-green-800 bg-opacity-30 border border-green-400' :
              payoutStatus.includes('❌') ? 'bg-red-800 bg-opacity-30 border border-red-400' :
              'bg-yellow-800 bg-opacity-30 border border-yellow-400'
            }`}>
              <p className="text-sm">{payoutStatus}</p>
              {sendingPayout && (
                <div className="flex justify-center items-center mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-300"></div>
                  <span className="ml-2 text-xs">Processing...</span>
                </div>
              )}
            </div>
          )}

          <div className="bg-white bg-opacity-10 rounded-2xl shadow-lg p-6 text-center">
  <p className="text-base text-white mb-6">
  {isJackpot && '🎰 JACKPOT MODE! '}
  Stop the timer at exactly <span className="text-cyan-300">3.1415926</span> to win <span className="text-cyan-300">{isJackpot ? BASE_PRIZE * 2 : BASE_PRIZE} π</span>.  
  <span className="block mt-2 text-white">Have you got what it takes</span>
</p>



            {/* Skill Question */}
  {!skillConfirmed && (
  <div className="mb-4 text-left">
    <label className="block text-sm font-bold mb-2">Skill Question (required):</label>
    <p className="text-sm mb-2 text-white">{SKILL_QUESTION}</p>
    <input
      type="text"
      value={skillAnswer}
      onChange={(e) => setSkillAnswer(e.target.value)}
      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
      placeholder="Enter your answer"
    />
    {skillAnswer && skillAnswer.trim() !== SKILL_ANSWER && (
      <p className="text-sm text-red-400 mt-1">
        Incorrect answer. You must answer correctly to proceed.
      </p>
    )}
    <div className="flex justify-center mt-3">
      <button
        onClick={() => {
          if (skillAnswer.trim() === SKILL_ANSWER) {
            setSkillConfirmed(true);
          } else {
            alert('Incorrect. Please try again.');
          }
        }}
        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-full"
      >
        Submit
      </button>
    </div>
  </div>
)}



            {/* Game Display */}
            <div className="mb-6">
              <div className="text-6xl font-mono mb-4 h-16 flex items-center justify-center">
                {scrolling ? (
                  <span className="animate-pulse">{currentDigit}</span>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </div>

              {/* Progress Display */}
              <div className="flex justify-center gap-2 mb-4">
                {PI_DIGITS.map((expectedDigit, i) => {
                  const attempt = progress[i]
                  return (
                    <div
                      key={i}
                      className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold ${
                        attempt
                          ? attempt.success
                            ? 'bg-green-500 text-black'
                            : 'bg-red-500 text-white'
                          : i === digitIndex && scrolling
                          ? 'bg-yellow-400 text-black animate-pulse'
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {attempt ? attempt.hit : expectedDigit}
                    </div>
                  )
                })}
              </div>

              <p className="text-sm text-gray-400 mb-4">
                Target: 3.1415926 | Progress: {progress.filter(p => p.success).length}/{PI_DIGITS.length}
              </p>

              {result && (
                <p className={`text-lg font-bold mb-4 ${
                  result.includes('🏆') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {result}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!scrolling && !freePlayedToday && !showConfetti && (
                <button
                  onClick={startFreeTry}
                  disabled={!skillAnswerIsCorrect || !user}
                  className={`w-full py-3 px-6 rounded-full font-bold transition ${
                    skillAnswerIsCorrect && user
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
                      : 'bg-gray-500 text-white cursor-not-allowed'
                  }`}
                >
                  {!user ? 'Login Required' : 'Free Try Today'}
                </button>
              )}
{scrolling && (
  <button
    onClick={handleStop}
    className="w-full py-3 px-6 rounded-full font-bold bg-cyan-400 text-white transition hover:bg-cyan-300"
  >
    STOP
  </button>
)}

{!scrolling && (freePlayedToday || result.includes('❌')) && canRetry && !showConfetti && (
  <button
    onClick={retry}
    disabled={!skillAnswerIsCorrect}
    className={`w-full py-3 px-6 rounded-full font-bold text-white transition ${
      skillAnswerIsCorrect
        ? 'bg-cyan-400 hover:bg-cyan-300'
        : 'bg-gray-500 cursor-not-allowed'
    }`}
  >
    Retry (${RETRY_PRICE}π) - {MAX_RETRIES - retries} left
  </button>
)}
            </div>
 {/* Stats */}
<div className="mt-6 text-xs text-white space-y-1">
  <p>Daily reset: {nextFreeCountdown}</p>
  <p>Best streak: {closestTry}/{PI_DIGITS.length} digits</p>
  <p>Win streak: {winStreak} days</p>
  <p className="text-white mt-2 ">We appreciate you, Pioneer. Thanks for playing with us!</p>
</div>


          </div>

          {showConfetti && <Confetti width={width} height={height} />}

          <div className="text-center space-y-2">
            <Link href="/try-your-luck" className="text-sm text-cyan-300 underline block">
              Back to Mini Games
            </Link>
            <Link href="/terms-conditions" className="text-xs text-cyan-300 underline block">
             Match The Codes Terms & Conditions
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
