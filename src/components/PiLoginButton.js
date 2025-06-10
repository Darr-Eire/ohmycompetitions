'use client'

import { useState } from 'react'

export default function PiLoginButton() {
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    try {
      // ✅ Include the mandatory callback to get the full session
      const result = await window.Pi.authenticate(
        ['username', 'payments'],
        async (incompletePayment) => {
          console.warn('📌 Incomplete payment detected:', incompletePayment)
          // Optional: auto-complete any lingering payments
          if (incompletePayment?.identifier && incompletePayment?.transaction?.txid) {
            await fetch('/api/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: incompletePayment.identifier,
                txid: incompletePayment.transaction.txid,
              }),
            })
          }
        }
      )

      const loginRes = await fetch('/api/auth/pi-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: result.accessToken }),
      })

      if (!loginRes.ok) throw new Error('Pi login failed')

      localStorage.setItem('piUser', JSON.stringify(result.user))

      // ✅ Redirect after login
      window.location.href = '/account'
    } catch (err) {
      console.error('🚨 Pi login failed:', err)
      alert('Login error – check console')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="neon-button text-white text-sm px-4 py-2"
    >
      {loading ? 'Logging in…' : 'Login with Pi'}
    </button>
  )
}
