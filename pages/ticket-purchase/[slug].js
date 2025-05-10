'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import PiLoginButton from '@/components/PiLoginButton'
import BuyTicketButton from '@/components/BuyTicketButton'
import COMPETITIONS from '@/data/competitions'
import '@fontsource/orbitron'

export default function TicketPurchasePage() {
  const router = useRouter()
  const { slug } = router.query
  const { data: session, status } = useSession()

  const [quantity, setQuantity] = useState(1)
  const [discount, setDiscount] = useState(0)
  const [timeLeft, setTimeLeft] = useState('')

  const comp = COMPETITIONS[slug]
  const isReady = router.isReady && !!comp
  const isDaily = comp?.theme === 'daily'
  const isPi = comp?.theme === 'pi'
  const currentPrice = comp?.entryFee - discount
  const totalPrice = currentPrice * quantity

  useEffect(() => {
    if (!comp?.endsAt) return

    const interval = setInterval(() => {
      const end = new Date(comp.endsAt).getTime()
      const now = Date.now()
      const diff = end - now

      if (diff <= 0) {
        setTimeLeft('Ended')
        clearInterval(interval)
        return
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const secs = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft(`${hrs}h ${mins}m ${secs}s`)
    }, 1000)

    return () => clearInterval(interval)
  }, [comp?.endsAt])

  if (!isReady) return null

  return (
    <div className="bg-[#0f172a] min-h-screen text-white py-6 px-4 font-orbitron">
      <div className={`max-w-xl mx-auto rounded-xl shadow-xl overflow-hidden border-2 ${isDaily || isPi ? 'border-cyan-400' : 'border-blue-500'} bg-[#0f172a]`}>

        {/* Header */}
        <div className={`px-4 py-3 text-center ${isDaily || isPi ? 'bg-gradient-to-r from-[#00ffd5] to-[#0077ff]' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}>
          <h1 className="text-xl sm:text-2xl font-bold text-black uppercase">{comp.title}</h1>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-center">
          {comp.imageUrl && (
            <img
              src={comp.imageUrl}
              alt={comp.title}
              className={`w-full max-h-80 object-cover rounded-lg border ${isDaily || isPi ? 'border-cyan-400' : 'border-blue-500'} mx-auto`}
            />
          )}

          <p className="text-cyan-300 text-lg font-semibold">🏆 {comp.prize}</p>

          {timeLeft && (
            <div className={`px-4 py-2 rounded-lg inline-block mx-auto ${isDaily || isPi ? 'bg-gradient-to-r from-[#00ffd5] to-[#0077ff]' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}>
              <p className="text-sm text-black font-mono font-bold">⏳ Ends In: {timeLeft}</p>
            </div>
          )}

          <div className="space-y-1 text-sm">
            <p><strong>Date:</strong> {comp.date}</p>
            <p><strong>Time:</strong> {comp.time}</p>
            <p><strong>Location:</strong> {comp.location}</p>
          </div>

          <div className="space-y-1 text-sm">
            <p>Entry Fee: <strong>{comp.entryFee} π</strong></p>
            {discount > 0 && (
              <p className="text-green-400">Discount: <strong>-{discount} π</strong></p>
            )}
            <p className="font-semibold">Price per ticket: {currentPrice.toFixed(2)} π</p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="bg-cyan-500 text-black px-4 py-1 rounded-full font-bold disabled:opacity-50"
                disabled={quantity <= 1}
              >−</button>
              <span className="text-lg font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="bg-cyan-500 text-black px-4 py-1 rounded-full font-bold"
              >+</button>
            </div>
          </div>

          <div>
            <p className="text-lg font-bold">Total: {totalPrice.toFixed(2)} π</p>
          </div>

          <p className="text-gray-400 text-sm">
            Secure your entry to win <strong>{comp.prize}</strong> — don’t miss out!
          </p>

          {/* CTA */}
          {status === 'loading' ? (
            <p className="text-gray-400">Checking login status…</p>
          ) : !session ? (
            <PiLoginButton />
          ) : (
            <BuyTicketButton
              competitionSlug={slug}
              entryFee={currentPrice}
              quantity={quantity}
              uid={session.user.uid}
              className="w-full py-3 mt-4 rounded-lg font-bold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black hover:brightness-110"
            />
          )}
        </div>
      </div>
    </div>
  )
}
