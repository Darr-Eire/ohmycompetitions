'use client'

import { useEffect } from 'react'

export default function LoginButton() {
  const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (typeof window !== 'undefined' && window.Pi) {
      window.Pi.authenticate(['username'], function (piUser: any) {
        console.log('Authenticated Pi user:', piUser)
      })
    } else {
      alert('Pi Network SDK not available. Open in Pi Browser.')
    }
  }

  useEffect(() => {
    console.log('LoginButton mounted')
  }, [])

  return (
    <button
      className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded"
      onClick={handleLogin}
    >
      Login with Pi
    </button>
  )
}
