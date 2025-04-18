'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ThousandPiDetailsPage() {
  const [quantity, setQuantity] = useState(1)

  const handlePay = () => {
    const total = 0.314 * quantity
    alert(`Simulating Pi payment of ${total.toFixed(3)}π for ${quantity} tickets`)
    // Replace alert with Pi payment logic
  }

  return (
    <>
      <Header />
      <main className="flex flex-col items-center px-4 py-8 max-w-xl mx-auto text-center">
        <img src="/pi.jpeg" alt="1000 Pi Giveaway" className="w-full max-w-md h-52 object-contain rounded-lg mb-4" />
        <h1 className="text-2xl font-bold text-blue-600 mb-2">1000 Pi Giveaway</h1>
        <p className="text-gray-600 mb-4">Buy tickets for your chance to win 1000 Pi! The more you enter, the higher your chances.</p>

        <div className="flex items-center gap-3 mb-4">
          <label htmlFor="quantity" className="font-medium">Tickets:</label>
          <input
            id="quantity"
            type="number"
            value={quantity}
            min={1}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-20 text-center border border-gray-300 rounded px-2 py-1"
          />
        </div>

        <div className="text-sm text-gray-700 mb-4">🎟️ Price per ticket: <strong>0.314π</strong></div>
        <div className="text-lg font-semibold text-blue-700 mb-6">Total: {(0.314 * quantity).toFixed(3)} π</div>

        <button
          onClick={handlePay}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
        >
          Pay with Pi
        </button>
      </main>
      <Footer />
    </>
  )
}
