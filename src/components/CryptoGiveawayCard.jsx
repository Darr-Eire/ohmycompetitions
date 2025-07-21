'use client'
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export default function CryptoGiveawayCard({
  comp,
  title,
  prize,
  fee = '10 π',
  href,
  token = 'BTC',
  totalTickets = 5000,
  endsAt = '2025-06-01T23:59:59Z',
}) {
  const widgetRef = useRef(null)
  const comingSoon = comp?.comingSoon === true

  const [timeLeft, setTimeLeft] = useState('')
  const [status, setStatus] = useState('UPCOMING')

  useEffect(() => {
    if (!widgetRef.current) return
    widgetRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbol: `BINANCE:${token}USDT`,
      width: '100%',
      height: '200',
      locale: 'en',
      dateRange: '1D',
      colorTheme: 'dark',
      trendLineColor: '#00FF00',
      underLineColor: 'rgba(0, 255, 0, 0.15)',
      isTransparent: true,
      autosize: true,
    })

    widgetRef.current.appendChild(script)
  }, [token])

  useEffect(() => {
    if (comingSoon) {
      setTimeLeft('')
      setStatus('COMING SOON')
      return
    }

    const interval = setInterval(() => {
      const now = Date.now()
      const end = new Date(endsAt).getTime()
      const diff = end - now

      if (diff <= 0) {
        setTimeLeft('')
        setStatus('ENDED')
        clearInterval(interval)
        return
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const m = Math.floor((diff / (1000 * 60)) % 60)
      const s = Math.floor((diff / 1000) % 60)

      let t = ''
      if (d > 0) t += `${d}d `
      if (h > 0 || d > 0) t += `${h}h `
      if (m > 0 || h > 0 || d > 0) t += `${m}m `
      if (d === 0 && h === 0) t += `${s}s`

      setTimeLeft(t.trim())
      setStatus('LIVE')
    }, 1000)

    return () => clearInterval(interval)
  }, [endsAt, comingSoon])

  const formattedEndDate = new Date(endsAt).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const startDate = new Date(comp?.startsAt || endsAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const drawDate = new Date(endsAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="relative rounded-xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] shadow-xl border border-cyan-600/20 overflow-hidden transition-all duration-300 max-w-sm mx-auto">
      {/* Optional Badge */}
      {comingSoon && (
        <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-orange-400 to-orange-500 text-sm font-bold px-2 py-1 rounded shadow animate-pulse">
          Coming Soon
        </div>
      )}

      {/* Chart Header */}
      <div className="w-full -mt-1 -mx-4 overflow-hidden">
        <div ref={widgetRef} className="w-full h-[200px]" />
      </div>

      {/* Competition Info */}
      <div className="p-4 space-y-3 text-sm text-white font-orbitron">
        <h3 className="text-lg font-bold text-center text-cyan-300">{title}</h3>
        <p className="text-center text-gray-300 text-sm">{prize}</p>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-cyan-300">Entry Fee:</span>
            <span>{comingSoon ? 'TBA' : fee}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cyan-300">Total Tickets:</span>
            <span>{comingSoon ? 'TBA' : totalTickets.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cyan-300">Start Date:</span>
            <span>{comingSoon ? 'TBA' : startDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cyan-300">Draw Date:</span>
            <span>{comingSoon ? 'TBA' : drawDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cyan-300">
              {status === 'LIVE' ? 'Ends In:' : comingSoon ? 'Status:' : 'Draws:'}
            </span>
            <span>{status === 'LIVE' ? timeLeft : comingSoon ? 'Coming Soon' : formattedEndDate}</span>
          </div>
        </div>

        {/* Call To Action */}
        {comingSoon ? (
          <button
            disabled
            className="w-full py-2 rounded-md bg-gradient-to-r from-[#00ffd5] to-[#0077ff] opacity-60 cursor-not-allowed font-bold text-black shadow mt-2"
          >
            Coming Soon
          </button>
        ) : (
          <Link
            href={href || (comp?.slug ? `/competitions/${comp.slug}` : '#')}
            className="inline-block w-full py-2 mt-3 rounded-md bg-gradient-to-r from-cyan-400 to-cyan-600 text-black font-bold shadow hover:brightness-110 transition"
          >
            Enter Now
          </Link>
        )}
      </div>
    </div>
  )
}

  
