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

  const phaseText = {
    'pre-drop': '🔒 Next Code Coming Soon...',
    'code-active': '⏳ Code Live',
    'waiting-draw': '🎯 Waiting for Draw...',
    'claim-window': '🔥 Winner must submit code!',
    'rollover': '💤 Prize Rolling Over...',
    'loading': 'Loading...'
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-cyan-400 neon-outline text-white p-4 sm:p-6 rounded-2xl text-center space-y-4 shadow-[0_0_40px_#00ffd5aa] max-w-4xl mx-auto mt-4 font-orbitron relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-cyan-400/10 via-transparent to-transparent -z-10 animate-pulse-slow" />

      <h2 className="text-2xl sm:text-3xl font-bold text-cyan-300 animate-pulse">💸 Pi Cash Code</h2>
      <p className="text-base sm:text-lg text-white/80">{phaseText[phase]}</p>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-2">
        {endTime && duration > 0 && (
          <CountdownRing endTime={endTime} duration={duration} color="#22d3ee" size={100} />
        )}

        <div className="space-y-2">
          <div className="relative bg-black border-4 border-cyan-300 rounded-xl px-4 py-3 text-cyan-200 text-xl font-mono tracking-widest shadow-[0_0_14px_#22d3ee] animate-glitch select-none">
            {code || '????-????'}
          </div>
          <div className="text-sm text-white/60">{timerLabel}</div>
          <div className="text-base">
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
    <button className="mt-4 px-5 py-2.5 bg-gradient-to-r from-yellow-300 to-cyan-400 rounded-lg text-black font-bold shadow-xl hover:scale-105 hover:shadow-cyan-300/60 transition duration-300">
      🎟️ Enter Now
    </button>
  </Link>
      )}
    </div>
  )
}
