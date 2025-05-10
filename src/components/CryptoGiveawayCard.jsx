'use client'
import React, { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function CryptoGiveawayCard({
  comp,
  title,
  prize,
  fee = '10 π',
  href,
  token = 'BTC',
  totalTickets = 5000,
  endsAt = '2025-06-01T23:59:59Z'
}) {
  const widgetRef = useRef(null)

  useEffect(() => {
    if (!widgetRef.current) return

    widgetRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbol: `BINANCE:${token}USDT`,
      width: "100%",
      height: "200",
      locale: "en",
      dateRange: "1D",
      colorTheme: "dark",
      trendLineColor: "#00FF00",
      underLineColor: "rgba(0, 255, 0, 0.15)",
      isTransparent: true,
      autosize: true
    })

    widgetRef.current.appendChild(script)
  }, [token])

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
        <h3 className="text-lg font-bold text-green-400">{title}</h3>
        <p className="text-sm text-gray-300">{prize}</p>
        <p className="text-sm text-yellow-300 font-semibold">Entry Fee: {fee}</p>
        <p className="text-xs text-gray-400">Total Tickets: {totalTickets}</p>
        <p className="text-xs text-cyan-400">Ends: {formattedEndDate}</p>

        {/* CTA */}
        <Link
          href={href || (comp?.slug ? `/competitions/${comp.slug}` : '#')}
          className="inline-block px-5 py-2 mt-2 rounded-md bg-cyan-500 text-black font-semibold shadow hover:bg-cyan-400 transition"
        >
          Enter Now
        </Link>
      </div>
    </div>
  )
}







