'use client'

import { useEffect } from 'react'

export default function LoginButton() {
  const handleLogin = async () => {
    if (typeof window !== 'undefined' && window.Pi) {
      try {
        const scopes = ['username', 'payments']
        const onIncompletePaymentFound = (payment: any) => {
          console.log('🟡 Incomplete payment found:', payment)
        }

        const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound)
        console.log('✅ Authenticated Pi User:', auth)

        // (Optional) Verify on server using /me
        const me = await fetch('/api/pi-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(auth),
        })

        const meResult = await me.json()
        console.log('🧠 Verified Pi User from server:', meResult)
      } catch (error) {
        console.error('❌ Pi Auth error:', error)
      }
    } else {
      alert('⚠️ Pi Network SDK not available. Please open in Pi Browser.')
    }
  }

  useEffect(() => {
    console.log('🔄 LoginButton mounted')
  }, [])

  return (
    <button className="bg-yellow-400 hover:bg-yellow-300 px-4 py-2 rounded" onClick={handleLogin}>
      Login with Pi
    </button>
  )
}
