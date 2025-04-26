// src/components/layout.js
import { useState } from 'react'
import Header from './header'
import Footer from './footer'

export default function Layout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    // your logout logic here (e.g. clear tokens/cookies)
    setIsLoggedIn(false)
  }

  return (
    <div className="layout">
      <Header 
        isLoggedIn={isLoggedIn} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
      />
      <main className="content">{children}</main>
      <Footer />
    </div>
  )
}
