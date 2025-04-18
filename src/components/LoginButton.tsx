'use client'

import { useState } from 'react'

declare global {
  interface Window {
    Pi: any
  }
}

export default function LoginButton() {
  const [username, setUsername] = useState<string | null>(null)

  const handleLogin = async () => {
    try {
      const result = await window.Pi.authenticate(['username'])
      setUsername(result.user.username)
    } catch (error: any) {
      alert('Login failed: ' + error.message)
    }
  }

  return (
    <div className="p-4">
      {username ? (
        <p className="text-green-600 font-medium">Welcome, {username}!</p>
      ) : (
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login with Pi
        </button>
      )}
    </div>
  )
}
