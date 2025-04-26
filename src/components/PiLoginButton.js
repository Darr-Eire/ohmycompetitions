// src/components/PiLoginButton.js
'use client'
import { useState, useEffect } from 'react'

function loadPiSdk() {
  return new Promise((resolve, reject) => {
    if (window.Pi) return resolve(window.Pi)
    const s = document.createElement('script')
    s.src = 'https://sdk.minepi.com/pi-sdk.js'
    s.async = true
    s.onload = () => {
      if (window.Pi?.init) {
        window.Pi.init({ version: '2.0' })
        resolve(window.Pi)
      } else {
        reject(new Error('Pi SDK did not initialize'))
      }
    }
    s.onerror = () => reject(new Error('Failed to load Pi SDK'))
    document.head.appendChild(s)
  })
}

export default function PiLoginButton({ apiBaseUrl = '/api' }) {
  const [loading, setLoading] = useState(false)
  const [PiSdk, setPiSdk] = useState(null)

  useEffect(() => {
    loadPiSdk()
      .then(sdk => setPiSdk(sdk))
      .catch(err => console.error(err))
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    try {
      if (!PiSdk) throw new Error('Pi SDK not ready')
      const auth = await PiSdk.authenticate(['username','wallet_address'])
      const res = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ accessToken: auth.accessToken }),
      })
      if (!res.ok) throw new Error(`API failed: ${res.status}`)
      alert('Logged in!')
    } catch (err) {
      console.error(err)
      alert(`Login failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleLogin} disabled={loading || !PiSdk}>
      {loading ? 'Logging in…' : PiSdk ? 'Login with Pi' : 'Loading Pi…'}
    </button>
  )
}
