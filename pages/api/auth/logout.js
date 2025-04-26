import { useState } from 'react'
import Header from './Header'
import Footer from './footer'

export default function Layout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState(null)

  const handleLogin = async () => {
    // your Pi login logic here
    try {
      const { accessToken, user } = await window.Pi.authenticate(
        ['username', 'wallet_address']
      )
      // call your backend to set cookies/session
      const res = await fetch(
        `/api/auth/pi-login?accessToken=${encodeURIComponent(accessToken)}`,
        { method: 'GET', credentials: 'include' }
      )
      if (!res.ok) throw new Error(`Login failed (${res.status})`)

      // success!
      setUsername(user.username)
      setIsLoggedIn(true)
    } catch (e) {
      console.error(e)
      alert(e.message || 'Login failed')
    }
  }

  const handleLogout = async () => {
    // call your logout API
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setIsLoggedIn(false)
    setUsername(null)
  }

  return (
    <div className="layout">
      <Header
        isLoggedIn={isLoggedIn}
        username={username}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <main className="content">{children}</main>
      <Footer />
    </div>
  )
}
