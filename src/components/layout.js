'use client'

import { useState } from 'react'
import Header from './Header'
import Footer from './footer'

export default function Layout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    // Pi login logic (handled separately)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    // Pi logout logic (handled separately)
    setIsLoggedIn(false)
  }

  return (
    <div className="layout">
      <Header
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <main className="content">
        {children}
      </main>

      <Footer />
    </div>
  )
}

