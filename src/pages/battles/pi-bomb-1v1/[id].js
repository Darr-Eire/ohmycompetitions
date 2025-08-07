// file: src/pages/battles/pi-bomb-1v1/[id].js
'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import io from 'socket.io-client'

let socket
const DEMO_TIMERS = [5, 3, 2, 1]
const HOLD_LIMIT = 3
const EXPLODE_CHANCE = 0.1
const MAX_GAME_DURATION = 60 * 1000

export default function PiBomb1v1Game() {
  const router = useRouter()
  const { id } = router.query

  const [playerId, setPlayerId] = useState(null)
  const [opponentId, setOpponentId] = useState(null)
  const [holdingBomb, setHoldingBomb] = useState(false)
  const [timer, setTimer] = useState(0)
  const [initial, setInitial] = useState(0)
  const [status, setStatus] = useState('waiting')
  const [holdTime, setHoldTime] = useState(0)
  const [heatPenalty, setHeatPenalty] = useState(1)
  const [demo, setDemo] = useState(false)
  const [round, setRound] = useState(0)

  const timerRef = useRef(null)
  const overallTimeout = useRef(null)
  const botRef = useRef(null)

  useEffect(() => {
    if (status !== 'playing') return
    overallTimeout.current = setTimeout(() => {
      clearInterval(timerRef.current)
      setStatus(holdingBomb ? 'exploded' : 'won')
    }, MAX_GAME_DURATION)
    return () => clearTimeout(overallTimeout.current)
  }, [status, holdingBomb])

  useEffect(() => {
    if (!id || demo) return
    socket = io('/', { path: '/api/socket' })
    socket.emit('join', { battleId: id })

    socket.on('init', ({ playerId, opponentId, startTime }) => {
      setPlayerId(playerId)
      setOpponentId(opponentId)
      setHoldingBomb(playerId < opponentId)
      setInitial(startTime)
      setTimer(startTime)
      setStatus('playing')
    })
    socket.on('tick', ({ time }) => setTimer(time))
    socket.on('pass', ({ to, startTime }) => {
      setHoldingBomb(to === playerId)
      setHoldTime(0)
      setHeatPenalty(1)
      setInitial(startTime)
      setTimer(time => time)
    })
    socket.on('explode', ({ loser }) => {
      clearInterval(timerRef.current)
      clearTimeout(overallTimeout.current)
      setStatus(loser === playerId ? 'exploded' : 'won')
      if (demo) setRound(r => Math.min(r + 1, DEMO_TIMERS.length - 1))
    })

    return () => {
      socket.disconnect()
      clearInterval(timerRef.current)
      clearTimeout(overallTimeout.current)
    }
  }, [id, demo])

  useEffect(() => {
    if (status !== 'playing') return
    clearInterval(timerRef.current)

    if (demo) {
      const t0 = DEMO_TIMERS[round]
      setInitial(t0)
      setTimer(t0)
    }

    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (holdingBomb && Math.random() < EXPLODE_CHANCE) {
          clearInterval(timerRef.current)
          clearTimeout(overallTimeout.current)
          setStatus('exploded')
          if (demo) setRound(r => Math.min(r + 1, DEMO_TIMERS.length - 1))
          return 0
        }
        const dec = demo ? 1 : heatPenalty
        if (t <= dec) {
          clearInterval(timerRef.current)
          clearTimeout(overallTimeout.current)
          setStatus(holdingBomb ? 'exploded' : 'won')
          if (demo) setRound(r => Math.min(r + 1, DEMO_TIMERS.length - 1))
          return 0
        }
        return t - dec
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [demo, status, heatPenalty, holdingBomb, round])

  useEffect(() => {
    if (holdingBomb && status === 'playing') {
      const holdInterval = setInterval(() => {
        setHoldTime(ht => {
          const next = ht + 1
          if (next >= HOLD_LIMIT) setHeatPenalty(2)
          return next
        })
      }, 1000)
      return () => clearInterval(holdInterval)
    }
    setHoldTime(0)
    setHeatPenalty(1)
  }, [holdingBomb, status])

  useEffect(() => {
    if (!demo) return
    clearTimeout(botRef.current)
    if (status === 'playing' && !holdingBomb) {
      const safeGap = Math.min(HOLD_LIMIT - 0.5, timer * 0.3)
      botRef.current = setTimeout(() => setHoldingBomb(true), safeGap * 1000)
    }
    return () => clearTimeout(botRef.current)
  }, [demo, holdingBomb, status, timer])

  useEffect(() => {
    if (!demo && holdingBomb && status === 'playing') {
      timerRef.current = setInterval(
        () => socket.emit('decrement', { battleId: id }),
        1000
      )
    }
    return () => clearInterval(timerRef.current)
  }, [demo, holdingBomb, status, id])

  const passBomb = () => {
    if (!holdingBomb) return
    if (demo) {
      setHoldingBomb(false)
    } else {
      socket.emit('pass', { battleId: id, from: playerId, to: opponentId })
    }
  }

  const startDemo = () => {
    setDemo(true)
    setRound(0)
    setPlayerId('You')
    setOpponentId('Bot')
    setHoldingBomb(true)
    setStatus('playing')
  }

  const backToLobby = () => router.push('/battles/lobby')

  const radius = 80
  const circumference = 2 * Math.PI * radius
  const progress = initial ? (timer / initial) * circumference : circumference

  return (
    <>
      <Head>
        <title>{`Pi Bomb 1v1 ${demo ? '(Demo)' : `#${id}`}`}</title>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap" rel="stylesheet" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center p-4 font-[Orbitron]">
        <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur bg-white/5 text-white text-center space-y-8 border border-white/10">

          <h1 className="text-4xl font-bold tracking-wide bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-transparent bg-clip-text">
            💣 Pi Bomb 1v1 {demo ? '(Demo)' : ''}
          </h1>

          {!demo && status === 'waiting' && (
            <>
              <button
                onClick={startDemo}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold shadow-lg transition duration-300"
              >
                Start Demo
              </button>
              <p className="text-sm text-gray-300">Waiting for opponent…</p>
            </>
          )}

          {(demo || status === 'playing') && (
            <>
              <p className={`text-xl ${holdingBomb ? 'text-red-400' : 'text-green-400'} font-medium`}>
                {holdingBomb ? '🔥 Your turn!' : '🕑 Opponent’s turn…'}
              </p>

              <div className="relative mx-auto w-48 h-48">
                <svg className="transform -rotate-90" width="200" height="200">
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    stroke="#334155"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    stroke={holdingBomb ? '#f43f5e' : '#10b981'}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <div className={`absolute inset-0 flex items-center justify-center text-5xl font-bold ${holdingBomb ? 'animate-pulse' : ''}`}>
                  π
                </div>
              </div>

              {holdingBomb && holdTime >= HOLD_LIMIT && (
                <div className="w-full bg-red-900 h-2 rounded overflow-hidden mt-2">
                  <div
                    className="bg-red-500 h-2"
                    style={{
                      width: `${Math.min((holdTime - HOLD_LIMIT) / 5, 1) * 100}%`,
                      transition: 'width 1s linear',
                    }}
                  />
                </div>
              )}

              <button
                onClick={passBomb}
                disabled={!holdingBomb}
                className={`mt-6 px-8 py-3 text-lg rounded-full font-bold transition duration-300 ${
                  holdingBomb
                    ? 'bg-red-600 hover:bg-red-500 shadow-lg'
                    : 'bg-gray-700 cursor-not-allowed text-gray-300'
                }`}
              >
                Pass π
              </button>
            </>
          )}

          {status === 'exploded' && (
            <p className="text-2xl font-bold text-red-500">💥 You Exploded!</p>
          )}
          {status === 'won' && (
            <p className="text-2xl font-bold text-green-400">🎉 You Survived!</p>
          )}

          {(status === 'exploded' || status === 'won') && (
            <button
              onClick={backToLobby}
              className="mt-4 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-full font-bold transition duration-300"
            >
              Back to Lobby
            </button>
          )}
        </div>
      </main>
    </>
  )
}
