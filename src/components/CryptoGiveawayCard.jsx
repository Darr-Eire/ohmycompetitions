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

  // Timer states
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

  // Countdown timer effect
  useEffect(() => {
    if (comingSoon) {
      setTimeLeft('')
      setStatus('COMING SOON')
      return
    }

    const interval = setInterval(() => {
      const now = Date.now()
      const end = new Date(endsAt).getTime()
      let diff = end - now

      if (diff <= 0) {
        setTimeLeft('')
        setStatus('ENDED')
        clearInterval(interval)
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      diff -= days * (1000 * 60 * 60 * 24)

      const hrs = Math.floor(diff / (1000 * 60 * 60))
      diff -= hrs * (1000 * 60 * 60)

      const mins = Math.floor(diff / (1000 * 60))
      diff -= mins * (1000 * 60)

      const secs = Math.floor(diff / 1000)

      let timeStr = ''
      if (days > 0) timeStr += `${days}d `
      if (hrs > 0 || days > 0) timeStr += `${hrs}h `
      if (mins > 0 || hrs > 0 || days > 0) timeStr += `${mins}m `
      if (days === 0 && hrs === 0) timeStr += `${secs}s`

      setTimeLeft(timeStr.trim())
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

  return (
    <div className="relative rounded-xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] shadow-xl border border-cyan-600/20 overflow-hidden transition-all duration-300 max-w-sm mx-auto">
      {/* HOT Badge */}
      <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow animate-pulse">
        🔥 HOT
      </div>

      {/* Line Chart Header */}
      <div className="w-full -mt-1 -mx-4 overflow-hidden">
        <div ref={widgetRef} className="w-full h-[200px]" />
      </div>

      {/* Competition Info */}
      <div className="p-4 text-center space-y-2">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-sm text-gray-300">{prize}</p>
        <p className="text-sm text-white font-semibold">
          Entry Fee: {comingSoon ? 'TBA' : fee}
        </p>
        <p className="text-xs text-white">
          Total Tickets: {comingSoon ? 'TBA' : totalTickets.toLocaleString()}
        </p>
        <p className="text-xs text-white">
          {status === 'LIVE' ? `Ends in: ${timeLeft}` : comingSoon ? 'TBA' : formattedEndDate}
        </p>

        {/* CTA */}
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
            className="inline-block px-5 py-2 mt-2 rounded-md bg-cyan-500 text-black font-semibold shadow hover:bg-cyan-400 transition"
          >
            Enter Now
          </Link>
        )}
      </div>
    </div>
  )
}
