'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// ✅ PiPaymentAPI type — move this to src/types/global.d.ts later if needed
type PiPaymentAPI = {
  createPayment: (
    paymentData: {
      amount: number
      memo: string
      metadata: Record<string, string | number>
    },
    callbacks: {
      onReadyForServerApproval: (paymentId: string) => void
      onReadyForServerCompletion: (paymentId: string, txid: string) => void
      onCancel: (paymentId: string) => void
      onError: (error: Error) => void
    }
  ) => void
}

export default function ThousandPiDetailsPage() {
  const [quantity, setQuantity] = useState(1)

  const handlePay = () => {
    if (!window.Pi) {
      alert('Pi SDK not available. Please open in Pi Browser.')
      return
    }

    const userId = localStorage.getItem('pi_user_uid')
    if (!userId) {
      alert('Please log in with Pi before making a payment.')
      return
    }

    const total = 0.314 * quantity

    const paymentData = {
      amount: parseFloat(total.toFixed(3)),
      memo: `Entry for 1000 Pi Giveaway (${quantity} ticket${quantity > 1 ? 's' : ''})`,
      metadata: {
        competitionId: '1000-pi-giveaway',
        tickets: quantity,
        userId,
      },
    }

    const callbacks = {
      onReadyForServerApproval: async (paymentId: string) => {
        console.log('🛡️ Ready for server approval', paymentId)
        try {
          const res = await fetch('/api/pi/approve-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId,
              userId,
              competitionId: '1000-pi-giveaway',
              quantity,
            }),
          })
          const result = await res.json()
          console.log('✅ Server approved:', result)
        } catch (err) {
          console.error('❌ Approval failed:', err)
        }
      },

      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
        console.log('✅ Ready for server completion', paymentId, txid)
        try {
          const res = await fetch('/api/pi/complete-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid }),
          })
          const result = await res.json()
          console.log('🎉 Server completed:', result)
          alert('🎉 Entry confirmed! Good luck!')
        } catch (err) {
          console.error('❌ Completion failed:', err)
        }
      },

      onCancel: (paymentId: string) => {
        console.warn('❌ Payment cancelled', paymentId)
      },

      onError: (error: Error) => {
        console.error('❌ Payment error', error)
      },
    }

    ;(window.Pi as PiPaymentAPI).createPayment(paymentData, callbacks)
  }

  return (
    <>
      <Header />
      <main className="flex flex-col items-center px-4 py-8 max-w-xl mx-auto text-center">
        <img
          src="/pi.jpeg"
          alt="1000 Pi Giveaway"
          className="w-full max-w-md h-52 object-contain rounded-lg mb-4"
        />
        <h1 className="text-2xl font-bold text-blue-600 mb-2">1000 Pi Giveaway</h1>
        <p className="text-gray-600 mb-4">
          Buy tickets for your chance to win 1000 Pi! The more you enter, the higher your chances.
        </p>

        <div className="flex items-center gap-3 mb-4">
          <label htmlFor="quantity" className="font-medium">
            Tickets:
          </label>
          <input
            id="quantity"
            type="number"
            value={quantity}
            min={1}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-20 text-center border border-gray-300 rounded px-2 py-1"
          />
        </div>

        <div className="text-sm text-gray-700 mb-4">
          🎟️ Price per ticket: <strong>0.314π</strong>
        </div>
        <div className="text-lg font-semibold text-blue-700 mb-6">
          Total: {(0.314 * quantity).toFixed(3)} π
        </div>

        <button
          onClick={handlePay}
          className="bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-300 transition"
        >
          Pay with Pi
        </button>
      </main>
      <Footer />
    </>
  )
}
