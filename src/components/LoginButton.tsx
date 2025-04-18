'use client'

import { useEffect } from 'react'
import type { PiUser } from '@/types/PiUser' // Make sure this file exists

export default function LoginButton() {
  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (typeof window !== 'undefined' && window.Pi) {
      const scopes = ['payments']

      function onIncompletePaymentFound(payment: unknown)
      {
        console.log('⚠️ Found incomplete payment:', payment)
      }

      try {
        const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound)
        // If you already created PiUser, then cast:
        const piUser = auth as PiUser
        
        console.log('✅ Pi Auth Success:', auth)

        // Optional: send to your backend for session
        // await fetch('/api/pi-auth', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(auth),
        // })
      } catch (error) {
        console.error('❌ Pi Auth Error:', error)
      }
    } else {
      alert('⚠️ Pi Network SDK not available. Please open in Pi Browser.')
    }
  }

  useEffect(() => {
    console.log('✅ LoginButton mounted')
  }, [])

  return (
    <button
      className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded"
      onClick={handleLogin}
    >
      Login with Pi
    </button>
  )
}
