'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import CountdownRing from './CountdownRing'
import PhaseStepper from './PhaseStepper'
import PhaseProgressBar from './PhaseProgressBar'

export default function PiCashHeroBanner({ code, prizePool, weekStart, expiresAt, drawAt, claimExpiresAt }) {
  const [phase, setPhase] = useState('loading')
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [duration, setDuration] = useState(0)
  const [timerLabel, setTimerLabel] = useState('')

  useEffect(() => {
    if (!weekStart || !expiresAt || !drawAt || !claimExpiresAt) return

    const now = new Date()
    const start = new Date(weekStart)
    const expire = new Date(expiresAt)
    const draw = new Date(drawAt)
    const claimEnd = new Date(claimExpiresAt)

    if (now < start) {
      setPhase('pre-drop')
      setStartTime(now)
      setEndTime(start)
      setDuration((start - now) / 1000)
      setTimerLabel('⏳ Time Until Next Code Drop')
    } else if (now >= start && now < expire) {
      setPhase('code-active')
      setStartTime(start)
      setEndTime(expire)
      setDuration((expire - start) / 1000)
      setTimerLabel('🔐 Time Until Code Disappears')
    } else if (now >= expire && now < draw) {
      setPhase('waiting-draw')
      setStartTime(expire)
      setEndTime(draw)
      setDuration((draw - expire) / 1000)
      setTimerLabel('🎯 Time Until Winner Draw')
    } else if (now >= draw && now < claimEnd) {
      setPhase('claim-window')
      setStartTime(draw)
      setEndTime(claimEnd)
      setDuration((claimEnd - draw) / 1000)
      setTimerLabel('🔥 Time Left to Claim Prize')
    } else {
      setPhase('rollover')
      setStartTime(claimEnd)
      setEndTime(claimEnd)
      setDuration(1)
      setTimerLabel('💤 Prize Rolling Over...')
    }
  }, [weekStart, expiresAt, drawAt, claimExpiresAt])

  if (!weekStart || !expiresAt || !drawAt || !claimExpiresAt) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-cyan-500 neon-outline text-white p-6 rounded-2xl text-center space-y-6 shadow-lg max-w-4xl mx-auto mt-10 font-orbitron">
        <h2 className="text-3xl sm:text-4xl font-bold text-cyan-300 animate-pulse">💸 Pi Cash Code</h2>
        <p className="text-lg text-white/80">Loading details...</p>
      </div>
    )
  }

  const phaseText = {
    'pre-drop': '🔒 Next Code Coming Soon...',
    'code-active': '⏳ Code Live — Enter now!',
    'waiting-draw': '🎯 Waiting for Draw...',
    'claim-window': '🔥 Winner must submit code!',
    'rollover': '💤 Prize Rolling Over...',
    'loading': 'Loading...'
  }

  return (
    <div className="bg-white/5 backdrop-blur-md border border-cyan-500 neon-outline text-white p-6 rounded-2xl text-center space-y-6 shadow-lg max-w-4xl mx-auto mt-10 font-orbitron">
      <h2 className="text-3xl sm:text-4xl font-bold text-cyan-300 animate-pulse">💸 Pi Cash Code</h2>
      <p className="text-lg sm:text-xl text-white/80">{phaseText[phase]}</p>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-4">
        {endTime && duration > 0 && (
          <CountdownRing endTime={endTime} duration={duration} color="#22d3ee" size={120} />
        )}

        <div className="space-y-2">
          <div className="text-2xl font-mono bg-gradient-to-r from-cyan-400 to-blue-500 text-black px-6 py-3 rounded-md tracking-widest shadow-lg border border-cyan-300 inline-block">
            {code || '????-????'}
          </div>
          <div className="text-sm text-white/60">{timerLabel}</div>
          <div className="text-lg">
            🏆 Prize Pool: <span className="text-yellow-300 font-bold">{prizePool ?? 0} π</span>
          </div>
        </div>
      </div>

      <PhaseStepper currentPhase={phase} />

      {startTime && endTime && (
        <PhaseProgressBar startTime={startTime} endTime={endTime} />
      )}

      {phase === 'code-active' && (
        <Link href="/pi-cash-code">
          <button className="mt-6 px-6 py-3 bg-gradient-to-r from-yellow-300 to-cyan-400 rounded-lg text-black font-bold shadow-xl hover:scale-105 transition">
            🎟️ Enter Now
          </button>
        </Link>
      )}
    </div>
  )
}
