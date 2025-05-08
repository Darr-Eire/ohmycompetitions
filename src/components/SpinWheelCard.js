'use client'

import { useState } from 'react'

export default function SpinWheelCard() {
  const [reward, setReward] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSpin = async () => {
    setReward(null)
    setError('')
    setLoading(true)

    const res = await fetch('/api/try-your-luck/spin', { method: 'POST' })
    const data = await res.json()

    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Something went wrong.')
    } else {
      setReward(data.reward)
    }
  }

  return (
    <div className="bg-white bg-opacity-10 p-6 rounded-2xl shadow-lg text-white max-w-md w-full mx-auto text-center">
      <h2 className="text-xl font-bold mb-4">🎡 Spin the Pi Wheel</h2>

      <button
        onClick={handleSpin}
        disabled={loading}
        className="btn-gradient px-6 py-2 rounded-full text-white font-semibold disabled:opacity-50"
      >
        {loading ? 'Spinning...' : 'Spin Now'}
      </button>

      {reward && (
        <div className="mt-4 text-green-400 font-bold text-lg">
          🎉 You won: {reward.result}
        </div>
      )}

      {error && (
        <div className="mt-4 text-yellow-300 font-medium">
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}
