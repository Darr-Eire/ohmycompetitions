'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import PiLoginButton from '@/components/PiLoginButton'
import BuyTicketButton from '@/components/BuyTicketButton'

import COMPETITIONS from '@/data/competitions' // consider moving COMPETITIONS to a separate file

export default function TicketPurchasePage() {
  const router = useRouter()
  const { slug } = router.query

  const { data: session, status } = useSession()
  const [quantity, setQuantity] = useState(1)
  const [discount, setDiscount] = useState(0)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!COMPETITIONS[slug]?.endsAt) return

    const interval = setInterval(() => {
      const end = new Date(COMPETITIONS[slug].endsAt).getTime()
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
  }, [slug])

  if (!router.isReady) return null

  const comp = COMPETITIONS[slug]
  if (!comp) {
    return (
      <div className="p-6 text-center text-white bg-[#0b1120] min-h-screen">
        <h1 className="text-2xl font-bold text-red-500">Competition Not Found</h1>
        <p className="mt-4">We couldn’t find “{slug}”.</p>
        <Link href="/" className="mt-6 inline-block text-blue-400 underline font-semibold">
          ← Back to Home
        </Link>
      </div>
    )
  }

  const currentPrice = comp.entryFee - discount
  const totalPrice = currentPrice * quantity

  return (
    <div className="bg-[#0b1120] min-h-screen text-white py-6 px-4">
      <div className="max-w-xl mx-auto border border-blue-500 rounded-xl shadow-xl overflow-hidden bg-[#0b1120]">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-black uppercase">{comp.title}</h1>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-center">
          <img
            src={comp.imageUrl}
            alt={comp.title}
            className="w-full max-h-86 object-cover rounded-lg border border-blue-500 mx-auto"
          />

          <p className="text-gray-300"><strong>Prize:</strong> {comp.prize}</p>

          {timeLeft && (
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 rounded-lg inline-block mx-auto">
              <p className="text-sm text-black font-mono font-bold">⏳ Ends In: <span>{timeLeft}</span></p>
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
                className="bg-blue-500 text-white px-4 py-1 rounded-full font-bold disabled:opacity-50"
                disabled={quantity <= 1}
              >−</button>
              <span className="text-lg font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="bg-blue-500 text-white px-4 py-1 rounded-full font-bold"
              >+</button>
            </div>
          </div>

          <div>
            <p className="text-lg font-bold">Total: {totalPrice.toFixed(2)} π</p>
          </div>

          <p className="text-gray-300 text-sm">
            Secure your entry to win <strong>{comp.prize}</strong> — don’t miss out!
          </p>

          {/* Auth-Gated Button */}
          {status === 'loading' ? (
            <p className="text-gray-400">Checking login status…</p>
          ) : !session ? (
            <PiLoginButton />
          ) : (
            <BuyTicketButton
              competitionSlug={slug}
              entryFee={currentPrice}
              quantity={quantity}
            />
          )}
        </div>
      </div>
    </div>
  )
}
