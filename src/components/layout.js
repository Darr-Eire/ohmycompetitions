import { useState } from 'react'
import Header from './Header'
import Footer from './footer'

export default function Layout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    // your Pi login logic would go here...
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    // your logout logic (clear tokens, etc.)
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
