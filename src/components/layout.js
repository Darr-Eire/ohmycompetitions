// src/components/layout.js
import { useState } from 'react'
import Header from './Header'
import Footer from './footer'

export default function Layout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogout = () => {
    // perform your logout logic: clear cookies, tokens, etc.
    setIsLoggedIn(false)
    // optionally redirect to login page:
    // router.push('/')
  }

  return (
    <div className="layout">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="content">{children}</main>
      <Footer />
    </div>
  )
}
