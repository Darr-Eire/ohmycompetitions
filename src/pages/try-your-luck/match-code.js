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

  const retry = () => {
    if (!skillAnswerIsCorrect) {
      alert('Answer the skill question correctly before retrying.')
      return
    }
    if (!canRetry) {
      alert(`Max retries reached (${MAX_RETRIES}).`)
      return
    }
    setRetries(r => r + 1)
    beginNewAttempt()
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

          {user && (
            <div className="bg-green-800 bg-opacity-30 border border-green-400 p-3 rounded-xl text-center">
              <p className="text-green-300">✅ Logged in as {user.username}</p>
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
            <p className="text-base text-gray-300 mb-6">
              {isJackpot && '🎰 JACKPOT MODE! '}
              Stop the timer at exactly π (3.1415926) to win {isJackpot ? BASE_PRIZE * 2 : BASE_PRIZE}π
            </p>

            {/* Skill Question */}
            <div className="mb-4 text-left">
              <label className="block text-sm font-bold mb-2">Skill Question (required):</label>
              <p className="text-sm mb-2 text-gray-300">{SKILL_QUESTION}</p>
              <input
                type="text"
                value={skillAnswer}
                onChange={(e) => setSkillAnswer(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Enter your answer"
              />
              {skillAnswer && !skillAnswerIsCorrect && (
                <p className="text-sm text-red-400 mt-1">
                  Incorrect answer. You must answer correctly to proceed.
                </p>
              )}
            </div>

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
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {!user ? 'Login Required' : 'Free Try Today'}
                </button>
              )}

              {scrolling && (
                <button
                  onClick={handleStop}
                  className="w-full py-3 px-6 rounded-full font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white transition"
                >
                  STOP
                </button>
              )}

              {!scrolling && (freePlayedToday || result.includes('❌')) && canRetry && !showConfetti && (
                <button
                  onClick={retry}
                  disabled={!skillAnswerIsCorrect}
                  className={`w-full py-3 px-6 rounded-full font-bold transition ${
                    skillAnswerIsCorrect
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Retry (${RETRY_PRICE}π) - {MAX_RETRIES - retries} left
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="mt-6 text-xs text-gray-400 space-y-1">
              <p>Daily reset: {nextFreeCountdown}</p>
              <p>Best streak: {closestTry}/{PI_DIGITS.length} digits</p>
              <p>Win streak: {winStreak} days</p>
            </div>
          </div>

          {showConfetti && <Confetti width={width} height={height} />}

          <div className="text-center space-y-2">
            <Link href="/try-your-luck" className="text-sm text-cyan-300 underline block">
              ← Back to Mini Games
            </Link>
            <Link href="/terms-conditions" className="text-xs text-gray-400 underline block">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
