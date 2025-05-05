// components/PiLoginButton.js
import { useState } from 'react'

export default function PiLoginButton() {
  const [loading, setLoading] = useState(false)
  const scopes = ['username', 'payments']

  function onIncompletePaymentFound(payment) {
    console.warn('Resuming incomplete payment:', payment)
  }

  async function handleLogin() {
    setLoading(true)
    try {
      const { accessToken, user } = await window.Pi.authenticate(
        scopes,
        onIncompletePaymentFound
      )

      // Send it to your Next.js API to verify
      const res = await fetch('/api/pi/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      })

      if (!res.ok) throw new Error('Verification failed')
      const { uid, username } = await res.json()

      console.log('✅ Verified Pioneer:', uid, username)
      // TODO: store this in your session or context,
      //       or call next-auth’s signIn() with credentials...
    } catch (err) {
      console.error('🚨 Pi login/verify error:', err)
      alert('Login failed. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleLogin} disabled={loading}>
      {loading ? 'Logging in…' : 'Log in with Pi'}
    </button>
  )
}
