'use client'

import { useEffect } from 'react'
import type { AuthResult } from './types/AuthResult'

export default function LoginButton() {
  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (typeof window !== 'undefined' && window.Pi) {
      const scopes = ['username', 'payments', 'wallet_address']

      function onIncompletePaymentFound(payment: unknown) {
        console.log('⚠️ Found incomplete payment:', payment)
      }

      try {
        const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
const typedAuth = auth as AuthResult;
const piUser = typedAuth.user;
const accessToken = typedAuth.accessToken;


        console.log('✅ Authenticated Pi User:', piUser)

        // 🔐 Save access token to localStorage
        localStorage.setItem('pi_access_token', accessToken)
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
