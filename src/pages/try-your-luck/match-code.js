'use client'

import { useEffect, useState, useRef } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@uidotdev/usehooks'
import Link from 'next/link'
import Head from 'next/head'

const PI_DIGITS = ['3', '1', '4', '1', '5', '9', '2', '6']
const DIGIT_SPEEDS = [1000, 900, 800, 600, 400, 300, 200, 150]
const MAX_RETRIES = 5
const RETRY_PRICE = 1
const BASE_PRIZE = 50
const JACKPOT_CHANCE = 314

export default function MatchPiGame() {
  const { width, height } = useWindowSize()
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
    } else {
      setDigitIndex(digitIndex + 1)
    }
  }

  const startFreeTry = () => {
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
  }

  const retry = () => {
    if (retries >= MAX_RETRIES) return
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
    <main className="min-h-screen px-4 py-12 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-orbitron flex flex-col items-center text-center">
      <div className="max-w-md w-full space-y-4 border border-cyan-700 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_#00fff055]">

        <div className="mb-2">
          <h1 className="bg-gradient-to-r from-[#0f172a]/70 via-[#1e293b]/70 to-[#0f172a]/70 border border-cyan-700 shadow-[0_0_30px_#00fff055] w-full max-w-md px-4 py-3 rounded-3xl text-cyan-300">
            Match The Pi Code
          </h1>
        </div>

        {winStreak >= 3 && (
          <div className="bg-cyan-800 bg-opacity-30 border border-cyan-400 p-3 rounded-xl">
            🌟 You're on a {winStreak}-day win streak! Bonus activated!
          </div>
        )}

        <p className="text-cyan-300 text-lg mx-auto">
          Match digits of π: <code>{PI_DIGITS.join('')}</code>
        </p>

        <div className="text-sm text-white">Next free try in: {nextFreeCountdown}</div>

        <div>
          <div className="text-sm mb-2 text-white">Hit in Order</div>
          <div className="flex justify-center gap-1 text-2xl">
            {PI_DIGITS.map((digit, i) => {
              const item = progress[i]
              const isNext = i === digitIndex
              return (
                <span key={i} className={`w-8 h-8 flex items-center justify-center rounded-md
                  ${item?.success ? 'bg-cyan-500 text-black'
                  : isNext ? 'bg-cyan-300 text-black animate-pulse'
                  : 'bg-gray-700'}`}>{item?.hit || digit}</span>
              )
            })}
          </div>
        </div>

        {scrolling && (
          <>
            <div className="py-6">
              <div className="text-6xl font-mono text-cyan-300 shadow-[0_0_20px_#22d3ee] border-4 border-cyan-500 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                {currentDigit}
              </div>
              <div className="mt-3 text-sm text-white">Tap “Stop” when this matches the target</div>
            </div>

            <button
              onClick={handleStop}
              className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-semibold px-6 py-3 rounded-xl shadow-[0_0_30px_#00fff055] border border-cyan-700 hover:brightness-110 transition w-full"
            >
              Stop
            </button>
          </>
        )}

        {!scrolling && (
          <button
            onClick={freePlayedToday ? retry : startFreeTry}
            className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white font-semibold px-6 py-3 rounded-xl shadow-[0_0_30px_#00fff055] border border-cyan-700 hover:brightness-110 transition w-full"
          >
            {freePlayedToday ? `Retry (${RETRY_PRICE}π)` : 'Start Daily Free Try'}
          </button>
        )}

        {result && (
          <div className="text-lg font-bold mt-4 text-cyan-300">{result}</div>
        )}

        <div>
          <button onClick={shareScore} className="text-sm text-cyan-300 underline">
            Share My Score
          </button>

          <div className="text-sm text-white mt-2">
            Closest Try: Matched {closestTry} / {PI_DIGITS.length} digits
          </div>

          {yesterdayStats && (
            <div className="mt-6 bg-cyan-950 bg-opacity-20 rounded-xl p-4 border border-cyan-600 text-sm text-cyan-300 space-y-2 inline-block text-left">
              <h2 className="text-base font-bold text-cyan-300">📅 Yesterday’s Results</h2>
              {Object.entries(yesterdayStats).map(([k, v], i) => (
                <div key={i}>
                  <strong>{k === 'free' ? 'Free' : `Paid #${k.replace('paid', '')}`}</strong>: {v.success ? '✅ Success' : '❌ Failed'} — reached {v.depth} / {PI_DIGITS.length}
                </div>
              ))}
            </div>
          )}

          <div className="text-sm text-white mt-2">
            Retries: {retries}/{MAX_RETRIES}
          </div>

          <Link href="/try-your-luck" className="text-sm text-cyan-300 underline block mt-4">
            Back to Mini Games
          </Link>

          {showConfetti && <Confetti width={width} height={height} />}

          <p className="text-xs text-white mt-6">
            By playing this game, you are agreeing to ohmycompetitions{' '}
            <Link href="/terms" className="underline text-cyan-400">Terms & Conditions</Link>
          </p>
        </div>

      </div>
    </main>
  )
}
